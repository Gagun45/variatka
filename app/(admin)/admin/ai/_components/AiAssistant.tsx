"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askInventoryAssistant, confirmInventoryBatch, getInventoryRecord, previewInventoryMutation, searchInventoryRecords } from "@/lib/actions/ai.actions";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { stuffKeys } from "@/features/stuff/stuff.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { frontendUrls } from "@/lib/urls";
import type { InventoryRecord, InventoryResult, InventorySearchResult, MutationResult } from "@/lib/ai/inventory.types";
import InventoryBatchView from "./InventoryBatchView";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import { completeBatchPreview } from "@/lib/ai/batch-preview";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import type { Clarification, InventorySearch } from "@/zod/ai-search.schema";
import { InventoryRecordView, InventorySearchView } from "./InventorySearchView";
import InventoryMutationView from "./InventoryMutationView";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";

type Message = { role: "user" | "assistant"; text: string };

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<InventorySearchResult | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [clarification, setClarification] = useState<Clarification | null>(null);
  const [previousSearch, setPreviousSearch] = useState<InventorySearch | null>(null);
  const [mutation, setMutation] = useState<InventoryMutationPreview | null>(null);
  const [pendingIntent, setPendingIntent] = useState<InventoryMutationIntent | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [notices, setNotices] = useState<MutationResult[]>([]);
  const [batch, setBatch] = useState<BatchPreview | null>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !prompt.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMutation(null);
    setPendingIntent(null);
    setNotices([]);
    setBatch(null);
    setAssumptions([]);
    const request = prompt.trim();
    setMessages((old) => [...old, { role: "user", text: request }]);
    setPrompt("");
    try {
      const result = await askInventoryAssistant({
        prompt: request,
        selected: selected ? { entity: selected.entity, id: selected.id } : null,
        previousSearch,
        clarification,
      });
      if (!result.ok) { setError(result.message); return; }
      setMessages((old) => [...old, { role: "assistant", text: result.data.message }]);
      const reply = result.data;
      setClarification(reply.operation === "clarify" ? reply.clarification : null);
      if (reply.operation === "search") {
        setResults(reply.results);
        setPreviousSearch(reply.results.search);
        setSelected(null);
      } else if (reply.operation === "viewSelected") {
        setSelected(reply.record);
      } else if (reply.operation === "batch") {
        setBatch(reply.preview);
        setAssumptions(reply.assumptions);
        setSelected(null);
      } else if (reply.operation === "mutation") {
        setMutation(reply.preview);
        setAssumptions(reply.assumptions);
        const entity = mutationDefinitions[reply.preview.kind].entity;
        if ("target" in reply.preview && (selected?.entity !== entity || selected.id !== reply.preview.target.id)) setSelected(null);
      } else if (reply.operation === "chooseMutationTarget") {
        setResults(reply.results);
        setPreviousSearch(reply.results.search);
        setSelected(null);
        setPendingIntent(reply.intent);
        setAssumptions(reply.assumptions);
      }
    } catch {
      setError("Не вдалося отримати відповідь. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function selectRecord(record: InventoryResult) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMutation(null);
    setClarification(null);
    setBatch(null);
    try {
      const result = await getInventoryRecord({ entity: record.entity, id: record.id });
      if (!result.ok) { setError(result.message); setSelected(null); return; }
      setSelected(result.data);
      if (pendingIntent) {
        const preview = await previewInventoryMutation(pendingIntent, { entity: record.entity, id: record.id });
        if (!preview.ok) { setError(preview.message); return; }
        if (mutationDefinitions[preview.data.kind].entity === "recipe") setBatch(completeBatchPreview([preview.data]));
        else setMutation(preview.data);
        setPendingIntent(null);
      }
      setMessages((old) => [...old, { role: "assistant", text: `Обрано: ${result.data.title}. Дані завантажено з бази.` }]);
    } catch {
      setError("Не вдалося завантажити запис. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function loadMore() {
    if (pending.current || !results?.hasMore) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await searchInventoryRecords(results.search, results.page + 1);
      if (!result.ok) { setError(result.message); return; }
      const existing = new Set(results.items.map((item) => `${item.entity}:${item.id}`));
      setResults({ ...result.data, items: [...results.items, ...result.data.items.filter((item) => !existing.has(`${item.entity}:${item.id}`))] });
    } catch {
      setError("Не вдалося завантажити результати. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function confirmMutation() {
    if (pending.current || (!mutation && !batch)) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await confirmInventoryBatch(batch ?? { items: [mutation!], unchanged: [] });
      if (!result.ok) { setError(result.message); return; }
      const written = result.data.results;
      const saved = written[0];
      setBatch(null);
      setMutation(null);
      setPendingIntent(null);
      setNotices(written);
      void queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      void queryClient.invalidateQueries({ queryKey: stuffKeys.stuff });
      void queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      void queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      // Refresh failures must not turn a successful write into an apparent failure.
      try {
        if (written.length !== 1 || saved.operation === "deleted") {
          setSelected(null);
          setResults((old) => old ? { ...old, items: old.items.filter((item) => item.entity !== saved.entity || item.id !== saved.id) } : null);
        } else {
          const record = await getInventoryRecord({ entity: saved.entity, id: saved.id });
          if (record.ok) setSelected(record.data);
          else { setSelected(null); setError("Операцію виконано. Оновіть пошук, щоб побачити актуальні дані."); }
        }
        if (results) {
          const refreshed = await searchInventoryRecords(results.search);
          if (refreshed.ok) setResults(refreshed.data);
          else setResults(null);
        }
      } catch {
        setSelected(null);
        setResults(null);
        setError("Операцію виконано. Оновіть пошук, щоб побачити актуальні дані.");
      }
    } catch {
      setError("Не вдалося підтвердити операцію. Перевірте список записів перед повторною спробою.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8" lang="uk">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI-помічник</h1>
        <p className="text-muted-foreground">Шукайте інгредієнти, рецепти й матеріали українською. Оберіть запис, щоб переглянути його дані та поставити уточнювальне запитання.</p>
        <p className="text-sm text-muted-foreground">Можна створювати, редагувати й видаляти інгредієнти, рецепти та матеріали, змінювати наявність і залишки. Кожна операція потребує перегляду та підтвердження. Також підтримуються рецепти зі складом і пакети до 20 операцій. Варіанти та залишки готової продукції поки не змінюються через AI.</p>
      </header>

      <div role="log" aria-label="Повідомлення" aria-live="polite" className="space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={`whitespace-pre-wrap break-words rounded-xl p-4 ${message.role === "user" ? "ml-6 bg-primary text-primary-foreground" : "mr-6 bg-muted"}`}>
            <p className="mb-1 text-xs font-semibold">{message.role === "user" ? "Ви" : "Помічник"}</p>
            {message.text}
          </div>
        ))}
      </div>

      {results && <InventorySearchView results={results} selected={selected} busy={busy} onSelect={selectRecord} onMore={loadMore} />}
      {pendingIntent && <div className="space-y-2 rounded-lg bg-muted p-3"><p role="status">Оберіть один запис вище для підготовки зміни. Ще нічого не збережено.</p><Button type="button" variant="outline" disabled={busy} onClick={() => { setPendingIntent(null); setError(""); }}>Скасувати операцію</Button></div>}
      {selected && <InventoryRecordView record={selected} busy={busy} onClear={() => { setSelected(null); setMutation(null); setBatch(null); setPendingIntent(null); setClarification(null); setError(""); }} />}
      {mutation && <InventoryMutationView preview={mutation} assumptions={assumptions} busy={busy} onChange={setMutation} onConfirm={confirmMutation} onCancel={() => { setMutation(null); setError(""); }} />}
      {batch && <InventoryBatchView preview={batch} assumptions={assumptions} busy={busy} onConfirm={confirmMutation} onCancel={() => { setBatch(null); setError(""); }} />}

      {notices.length > 0 && <div role="status" className="space-y-2 rounded-xl border p-4"><p className="font-medium">Виконано операцій: {notices.length}</p><ul className="space-y-1">{notices.map((notice, index) => <li key={index}>{notice.operation === "deleted" ? "Видалено" : notice.operation === "created" ? "Створено" : "Оновлено"}: {notice.operation === "deleted" ? notice.title : <Link className="underline" href={notice.entity === "ingredient" ? frontendUrls.ingredients.view(notice.id) : notice.entity === "recipe" ? frontendUrls.recipes.view(notice.id) : frontendUrls.stuff.view(notice.id)}>{notice.title}</Link>}</li>)}</ul></div>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {busy && <p role="status" className="text-muted-foreground">Обробка…</p>}

      {clarification && <section aria-label="Уточнення запиту" className="space-y-2 rounded-lg border p-4">
        <p className="font-medium">{clarification.question}</p>
        <p className="text-sm text-muted-foreground">Відповідь нижче продовжить попередній запит. Ще нічого не збережено.</p>
        <details className="text-sm"><summary className="cursor-pointer">Запит, який уточнюємо</summary><p className="mt-2 whitespace-pre-wrap break-words">{clarification.originalPrompt}</p></details>
        <Button type="button" variant="outline" disabled={busy} onClick={() => { setClarification(null); setError(""); }}>Скасувати уточнення</Button>
      </section>}

      <form onSubmit={propose} className="space-y-3">
        <label htmlFor="ai-prompt" className="font-medium">{clarification ? "Ваша відповідь" : "Ваш запит"}</label>
        <Textarea id="ai-prompt" required maxLength={12000} disabled={busy} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={clarification ? "Напишіть відповідь на уточнення" : "Покажи приховані непідтверджені соуси"} />
        <Button type="submit" disabled={busy || !prompt.trim()}>Надіслати</Button>
      </form>
    </main>
  );
}
