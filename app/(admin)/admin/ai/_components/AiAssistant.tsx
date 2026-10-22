"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Send } from "lucide-react";
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
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import { searchFilters } from "@/lib/ai/search-labels";
import { refreshAfterSave } from "@/lib/ai/refresh-after-save";
import { confirmationFailure, recoveryFor, requestPhaseLabels, type AssistantErrorCode, type RequestPhase } from "@/lib/ai/request-state";
import type { AssistantRequest } from "@/zod/ai-search.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import type { Clarification, InventorySearch } from "@/zod/ai-search.schema";
import { InventoryRecordView, InventorySearchView } from "./InventorySearchView";
import InventoryMutationView from "./InventoryMutationView";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";

type Message = { role: "user" | "assistant"; text: string };

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<RequestPhase>("idle");
  const busy = phase !== "idle";
  const [error, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState<AssistantErrorCode>("VALIDATION_ERROR");
  const lastRequest = useRef<AssistantRequest | null>(null);
  const requestSelection = useRef<InventoryRecord | null>(null);
  const refreshTargets = useRef<MutationResult[]>([]);
  const recovery = recoveryFor(errorCode);
  function setError(message: string, code: AssistantErrorCode = "VALIDATION_ERROR") {
    setErrorMessage(message);
    setErrorCode(code);
  }
  const [results, setResults] = useState<InventorySearchResult | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [clarification, setClarification] = useState<Clarification | null>(null);
  const [previousSearch, setPreviousSearch] = useState<InventorySearch | null>(null);
  const [mutation, setMutation] = useState<InventoryMutationPreview | null>(null);
  const [pendingIntent, setPendingIntent] = useState<InventoryMutationIntent | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [notices, setNotices] = useState<MutationResult[]>([]);
  const [batch, setBatch] = useState<BatchPreview | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();

  function newRequest() {
    if (pending.current) return;
    setPrompt("");
    lastRequest.current = null;
    requestSelection.current = null;
    refreshTargets.current = [];
    setMessages([]);
    setError("");
    setResults(null);
    setSelected(null);
    setClarification(null);
    setPreviousSearch(null);
    setMutation(null);
    setPendingIntent(null);
    setAssumptions([]);
    setNotices([]);
    setBatch(null);
    inputRef.current?.focus();
  }

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !prompt.trim()) return;
    await requestProposal({ prompt: prompt.trim(), selected: selected ? { entity: selected.entity, id: selected.id } : null, previousSearch, clarification });
  }

  function editRequest() {
    if (pending.current || !lastRequest.current) return;
    const request = lastRequest.current;
    setPrompt(request.prompt);
    setSelected(requestSelection.current);
    setPreviousSearch(request.previousSearch);
    setClarification(request.clarification);
    setMutation(null);
    setBatch(null);
    setPendingIntent(null);
    setError("");
    inputRef.current?.focus();
  }

  async function requestProposal(request: AssistantRequest) {
    if (pending.current) return;
    pending.current = true;
    setPhase("planning");
    setError("");
    setMutation(null);
    setPendingIntent(null);
    setNotices([]);
    setBatch(null);
    setAssumptions([]);
    if (!request.selected) requestSelection.current = null;
    else if (selected?.entity === request.selected.entity && selected.id === request.selected.id) requestSelection.current = selected;
    lastRequest.current = request;
    setMessages((old) => [...old, { role: "user", text: request.prompt }]);
    setPrompt("");
    try {
      const result = await askInventoryAssistant(request);
      if (!result.ok) { setPrompt(request.prompt); setError(result.message, result.code); return; }
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
      setPrompt(request.prompt);
      setError("Не вдалося отримати відповідь. Ваш запит не втрачено.", "PROVIDER_UNAVAILABLE");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  async function selectRecord(record: InventoryResult) {
    if (pending.current) return;
    pending.current = true;
    setPhase("loading");
    setError("");
    setMutation(null);
    setClarification(null);
    setBatch(null);
    try {
      const result = await getInventoryRecord({ entity: record.entity, id: record.id });
      if (!result.ok) { setError(result.message, result.code); setSelected(null); return; }
      setSelected(result.data);
      if (pendingIntent) {
        setPhase("preparing");
        const preview = await previewInventoryMutation(pendingIntent, { entity: record.entity, id: record.id });
        if (!preview.ok) { setError(preview.message, preview.code); return; }
        if (mutationDefinitions[preview.data.kind].entity === "recipe") setBatch(completeBatchPreview([preview.data]));
        else setMutation(preview.data);
        setPendingIntent(null);
      }
      setMessages((old) => [...old, { role: "assistant", text: `Обрано: ${result.data.title}. Дані завантажено з бази.` }]);
    } catch {
      setError("Не вдалося завантажити запис. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  async function loadMore() {
    if (pending.current || !results?.hasMore) return;
    pending.current = true;
    setPhase("loading");
    setError("");
    try {
      const result = await searchInventoryRecords(results.search, results.page + 1);
      if (!result.ok) { setError(result.message, result.code); return; }
      const existing = new Set(results.items.map((item) => `${item.entity}:${item.id}`));
      setResults({ ...result.data, items: [...results.items, ...result.data.items.filter((item) => !existing.has(`${item.entity}:${item.id}`))] });
    } catch {
      setError("Не вдалося завантажити результати. Спробуйте ще раз.");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  async function refreshSavedData(written: MutationResult[]) {
    setPhase("refreshing");
    const refreshed = await refreshAfterSave(written, previousSearch, {
      invalidate: () => Promise.all([
        queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients }),
        queryClient.invalidateQueries({ queryKey: stuffKeys.stuff }),
        queryClient.invalidateQueries({ queryKey: recipeKeys.recipes }),
        queryClient.invalidateQueries({ queryKey: recipeKeys.public }),
      ]),
      record: getInventoryRecord,
      search: searchInventoryRecords,
    });
    setSelected(refreshed.selected);
    if (previousSearch) setResults(refreshed.results);
    if (refreshed.failed) setError("Зміни збережено, але актуальні дані не вдалося завантажити.", "REFRESH_FAILED");
  }

  async function retryRefresh() {
    if (pending.current || !refreshTargets.current.length) return;
    pending.current = true;
    setError("");
    try { await refreshSavedData(refreshTargets.current); }
    finally { pending.current = false; setPhase("idle"); }
  }

  async function confirmMutation() {
    if (pending.current || (!mutation && !batch)) return;
    pending.current = true;
    setPhase("saving");
    setError("");
    try {
      const result = await confirmInventoryBatch(batch ?? { items: [mutation!], unchanged: [] });
      // Any failed confirmation discards the old preview, preventing blind retries.
      setBatch(null);
      setMutation(null);
      setPendingIntent(null);
      if (!result.ok) {
        const code = confirmationFailure(result.code);
        setError(code === "SAVE_UNCERTAIN" ? "Не вдалося отримати результат збереження." : result.message, code);
        return;
      }
      const written = result.data.results;
      refreshTargets.current = written;
      setNotices(written);
      await refreshSavedData(written);
    } catch {
      setBatch(null);
      setMutation(null);
      setPendingIntent(null);
      setError("Не вдалося отримати результат збереження.", "SAVE_UNCERTAIN");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-8" lang="uk">
      <h1 className="text-2xl font-semibold">AI-помічник</h1>

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
      {error && <div ref={errorRef} tabIndex={-1} role="alert" className={`space-y-3 rounded-xl border p-4 focus-visible:outline-2 focus-visible:outline-ring ${errorCode === "REFRESH_FAILED" ? "" : "border-destructive"}`}>
        <p className="font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">{recovery.hint}</p>
        <div className="flex flex-wrap gap-2">
          {recovery.action === "edit" && lastRequest.current && <Button type="button" variant="outline" disabled={busy} onClick={editRequest}>Редагувати запит</Button>}
          {recovery.action === "prepare" && lastRequest.current && <><Button type="button" disabled={busy} onClick={() => { if (lastRequest.current) void requestProposal(lastRequest.current); }}>Підготувати новий перегляд</Button><Button type="button" variant="outline" disabled={busy} onClick={editRequest}>Редагувати запит</Button></>}
          {recovery.action === "refresh" && <Button type="button" variant="outline" disabled={busy} onClick={retryRefresh}>Оновити дані</Button>}
          {recovery.action === "inspect" && <>{[["Інгредієнти", frontendUrls.ingredients.index], ["Рецепти", frontendUrls.recipes.index], ["Матеріали", frontendUrls.stuff.index]].map(([label, href]) => <Button key={href} asChild variant="outline"><Link href={href} target="_blank" rel="noopener noreferrer">{label}</Link></Button>)}</>}
        </div>
      </div>}
      {busy && <p role="status" aria-live="polite" className="text-muted-foreground">{requestPhaseLabels[phase]}</p>}

      {clarification && <section aria-label="Уточнення запиту" className="space-y-2 rounded-lg border p-4">
        <p className="font-medium">{clarification.question}</p>
        <p className="text-sm text-muted-foreground">Відповідь нижче продовжить попередній запит. Ще нічого не збережено.</p>
        <details className="text-sm"><summary className="cursor-pointer">Запит, який уточнюємо</summary><p className="mt-2 whitespace-pre-wrap break-words">{clarification.originalPrompt}</p></details>
        <Button type="button" variant="outline" disabled={busy} onClick={() => { setClarification(null); setError(""); }}>Скасувати уточнення</Button>
      </section>}

      {(selected || previousSearch) && <details className="rounded-lg border p-3 text-sm">
        <summary className="cursor-pointer font-medium">Контекст запиту</summary>
        <div className="mt-2 space-y-1">
          {selected && <p>Обрано: {inventoryEntityLabels[selected.entity]} «{selected.title}» · #{selected.id}.</p>}
          {previousSearch && <p>Пошук: {previousSearch.entity === "all" ? "Усі типи" : inventoryEntityLabels[previousSearch.entity]} · {searchFilters(previousSearch).join(" · ") || "Без додаткових фільтрів"}.</p>}
        </div>
      </details>}


      <form onSubmit={propose} className="space-y-3">
        <label htmlFor="ai-prompt" className="font-medium">{clarification ? "Ваша відповідь" : "Ваш запит"}</label>
        <Textarea ref={inputRef} id="ai-prompt" required maxLength={12000} disabled={busy} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={clarification ? "Напишіть відповідь на уточнення" : "Покажи приховані непідтверджені соуси"} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" className="min-h-11 gap-2 text-muted-foreground" disabled={busy} onClick={newRequest}>
            <MessageSquarePlus aria-hidden="true" />
            Новий чат
          </Button>
          <Button type="submit" className="min-h-11 gap-2 px-5" disabled={busy || !prompt.trim()}>
            Надіслати
            <Send aria-hidden="true" />
          </Button>
        </div>
      </form>
    </main>
  );
}
