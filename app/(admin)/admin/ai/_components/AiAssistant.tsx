"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { askInventoryAssistant, confirmInventoryMutation, getInventoryRecord, previewInventoryMutation, searchInventoryRecords } from "@/lib/actions/ai.actions";
import { createIngredient } from "@/lib/actions/ingredient.actions";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { stuffKeys } from "@/features/stuff/stuff.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { frontendUrls } from "@/lib/urls";
import type { IngredientDraft } from "@/zod/ai.schema";
import type { IIngredientFormValues } from "@/zod/ingredient.schema";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "@/lib/ai/inventory.types";
import type { InventorySearch } from "@/zod/ai-search.schema";
import { InventoryRecordView, InventorySearchView } from "./InventorySearchView";
import InventoryMutationView from "./InventoryMutationView";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";

type Message = { role: "user" | "assistant"; text: string };

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<IngredientDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ id: number; title: string } | null>(null);
  const [results, setResults] = useState<InventorySearchResult | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [previousSearch, setPreviousSearch] = useState<InventorySearch | null>(null);
  const [mutation, setMutation] = useState<InventoryMutationPreview | null>(null);
  const [pendingIntent, setPendingIntent] = useState<InventoryMutationIntent | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ operation: "created" | "updated" | "deleted"; entity: "ingredient" | "stuff"; id: number; title: string } | null>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();

  function editIngredient(patch: Partial<IIngredientFormValues>) {
    setDraft((old) => old?.ingredient
      ? { ...old, ingredient: { ...old.ingredient, ...patch } } : old);
  }

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !prompt.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setDraft(null);
    setCreated(null);
    setMutation(null);
    setPendingIntent(null);
    setNotice(null);
    setAssumptions([]);
    const request = prompt.trim();
    setMessages((old) => [...old, { role: "user", text: request }]);
    setPrompt("");
    try {
      const result = await askInventoryAssistant({
        prompt: request,
        selected: selected ? { entity: selected.entity, id: selected.id } : null,
        previousSearch,
      });
      if (!result.ok) { setError(result.message); return; }
      setMessages((old) => [...old, { role: "assistant", text: result.data.message }]);
      const reply = result.data;
      if (reply.operation === "search") {
        setResults(reply.results);
        setPreviousSearch(reply.results.search);
        setSelected(null);
      } else if (reply.operation === "viewSelected") {
        setSelected(reply.record);
      } else if (reply.operation === "createIngredient") {
        setDraft(reply.draft);
      } else if (reply.operation === "mutation") {
        setMutation(reply.preview);
        setAssumptions(reply.assumptions);
        const entity = reply.preview.kind.endsWith("Ingredient") ? "ingredient" : "stuff";
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
    setDraft(null);
    try {
      const result = await getInventoryRecord({ entity: record.entity, id: record.id });
      if (!result.ok) { setError(result.message); setSelected(null); return; }
      setSelected(result.data);
      if (pendingIntent) {
        const preview = await previewInventoryMutation(pendingIntent, { entity: record.entity, id: record.id });
        if (!preview.ok) { setError(preview.message); return; }
        setMutation(preview.data);
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

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || draft?.operation !== "createIngredient" || !draft.ingredient) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await createIngredient(draft.ingredient);
      if (!result.ok) { setError(result.message); return; }
      setCreated({ id: result.data.id, title: result.data.title });
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    } catch {
      setError("Не вдалося підтвердити створення. Перевірте список інгредієнтів перед повторною спробою.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function confirmMutation() {
    if (pending.current || !mutation) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await confirmInventoryMutation(mutation);
      if (!result.ok) { setError(result.message); return; }
      const saved = result.data;
      setMutation(null);
      setPendingIntent(null);
      setNotice(saved);
      setCreated(null);
      void queryClient.invalidateQueries({ queryKey: saved.entity === "ingredient" ? ingredientKeys.ingredients : stuffKeys.stuff });
      if (saved.entity === "ingredient") {
        void queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
        void queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      }
      // Refresh failures must not turn a successful write into an apparent failure.
      try {
        if (saved.operation === "deleted") {
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
        <p className="text-sm text-muted-foreground">Можна створювати, редагувати й видаляти інгредієнти та матеріали, змінювати наявність і залишки. Кожна операція потребує перегляду та підтвердження. Рецепти поки доступні лише для пошуку й перегляду.</p>
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
      {selected && <InventoryRecordView record={selected} busy={busy} onClear={() => { setSelected(null); setMutation(null); setDraft(null); setPendingIntent(null); setError(""); }} />}
      {mutation && <InventoryMutationView preview={mutation} assumptions={assumptions} busy={busy} onChange={setMutation} onConfirm={confirmMutation} onCancel={() => { setMutation(null); setError(""); }} />}

      {draft?.operation === "createIngredient" && draft.ingredient && (
        <form onSubmit={confirm} className="space-y-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Попередній перегляд</h2>
          <p className="text-sm text-muted-foreground">Ще нічого не збережено. Можна змінити будь-яке поле нижче.</p>
          {draft.assumptions.length > 0 && <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Запропоновані значення:</p>
            <ul className="list-disc pl-5">{draft.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </div>}
          <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
            <label className="block space-y-1"><span>Назва</span>
              <Input required maxLength={200} value={draft.ingredient.title} onChange={(e) => editIngredient({ title: e.target.value })} />
            </label>
            <label className="block space-y-1"><span>Опис</span>
              <Textarea maxLength={2000} value={draft.ingredient.description} onChange={(e) => editIngredient({ description: e.target.value })} />
            </label>
            <label className="block space-y-1"><span>Категорія</span>
              <select className="block w-full rounded-md border bg-background p-2" value={draft.ingredient.category} onChange={(e) => editIngredient({ category: e.target.value as IIngredientFormValues["category"] })}>
                <option value="SPICES">Спеції</option><option value="OTHER">Інше</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.ingredient.isInStock} onChange={(e) => editIngredient({ isInStock: e.target.checked })} />У наявності
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!draft.ingredient.title.trim()}>Підтвердити створення</Button>
              <Button type="button" variant="outline" onClick={() => { setDraft(null); setError(""); }}>Скасувати</Button>
            </div>
          </fieldset>
        </form>
      )}

      {created && <p role="status" className="rounded-xl border p-4">Створено: <Link className="underline" href={frontendUrls.ingredients.view(created.id)}>{created.title}</Link></p>}
      {notice && <p role="status" className="rounded-xl border p-4">{notice.operation === "deleted" ? "Видалено" : notice.operation === "created" ? "Створено" : "Оновлено"}: {notice.operation === "deleted" ? notice.title : <Link className="underline" href={notice.entity === "ingredient" ? frontendUrls.ingredients.view(notice.id) : frontendUrls.stuff.view(notice.id)}>{notice.title}</Link>}</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {busy && <p role="status" className="text-muted-foreground">Обробка…</p>}

      <form onSubmit={propose} className="space-y-3">
        <label htmlFor="ai-prompt" className="font-medium">Ваш запит</label>
        <Textarea id="ai-prompt" required maxLength={2000} disabled={busy} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Покажи приховані непідтверджені соуси" />
        <Button type="submit" disabled={busy || !prompt.trim()}>Надіслати</Button>
      </form>
    </main>
  );
}
