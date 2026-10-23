"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askInventoryAssistant, confirmInventoryBatch, getInventoryRecord, resumeInventoryWrite, searchInventoryRecords } from "@/lib/actions/ai.actions";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { stuffKeys } from "@/features/stuff/stuff.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { frontendUrls } from "@/lib/urls";
import type { PendingWrite, ResumeWrite } from "@/zod/ai-resolution.schema";
import RecordChoiceView from "./RecordChoiceView";
import type { AssistantReply, InventoryRecord, InventoryResult, InventorySearchResult, MutationResult } from "@/lib/ai/inventory.types";
import AssistantContext from "./AssistantContext";
import AssistantErrorPanel from "./AssistantErrorPanel";
import InventoryBatchView from "./InventoryBatchView";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import { refreshAfterSave } from "@/lib/ai/refresh-after-save";
import { confirmationFailure, requestPhaseLabels, type AssistantErrorCode, type DraftStatus, type RequestPhase } from "@/lib/ai/request-state";
import type { AssistantRequest } from "@/zod/ai-search.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import type { Clarification, InventorySearch } from "@/zod/ai-search.schema";
import { InventoryRecordView, InventorySearchView } from "./InventorySearchView";
import InventoryMutationView from "./InventoryMutationView";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";

type Message = { role: "user" | "assistant"; text: string };
type DraftSource = { request: AssistantRequest; selected: InventoryRecord | null };

export default function AiAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<RequestPhase>("idle");
  const busy = phase !== "idle";
  const [neutral, setNeutral] = useState("");
  const [error, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState<AssistantErrorCode>("VALIDATION_ERROR");
  const lastRequest = useRef<AssistantRequest | null>(null);
  const requestSelection = useRef<InventoryRecord | null>(null);
  const refreshTargets = useRef<MutationResult[]>([]);
  function setError(message: string, code: AssistantErrorCode = "VALIDATION_ERROR") {
    setNeutral("");
    if (code === "NO_CHANGES") { setNeutral(message); setErrorMessage(""); return; }
    setErrorMessage(message);
    setErrorCode(code);
  }
  const [results, setResults] = useState<InventorySearchResult | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [clarification, setClarification] = useState<Clarification | null>(null);
  const [previousSearch, setPreviousSearch] = useState<InventorySearch | null>(null);
  const [mutation, setMutation] = useState<InventoryMutationPreview | null>(null);
  const [pendingWrite, setPendingWrite] = useState<Extract<AssistantReply, { operation: "chooseRecord" }> | null>(null);
  const lastWrite = useRef<PendingWrite | null>(null);
  const draftSource = useRef<DraftSource | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("ready");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [notices, setNotices] = useState<MutationResult[]>([]);
  const [batch, setBatch] = useState<BatchPreview | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();

  function newRequest() {
    if (pending.current) return;
    setPrompt("");
    lastRequest.current = null;
    lastWrite.current = null;
    draftSource.current = null;
    setDraftStatus("ready");
    requestSelection.current = null;
    refreshTargets.current = [];
    setMessages([]);
    setError("");
    setResults(null);
    setSelected(null);
    setClarification(null);
    setPreviousSearch(null);
    setMutation(null);
    setPendingWrite(null);
    setAssumptions([]);
    setNotices([]);
    setBatch(null);
    inputRef.current?.focus();
  }

  function cancelWrite() {
    setPendingWrite(null);
    setMutation(null);
    setBatch(null);
    setAssumptions([]);
    lastWrite.current = null;
    draftSource.current = null;
    setDraftStatus("ready");
    setError("");
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
    setError("");
    inputRef.current?.focus();
  }

  async function requestProposal(request: AssistantRequest) {
    if (pending.current) return;
    pending.current = true;
    setPhase("planning");
    setError("");
    // Keep the current draft and its source until a replacement is ready.
    if (!request.selected) requestSelection.current = null;
    else if (selected?.entity === request.selected.entity && selected.id === request.selected.id) requestSelection.current = selected;
    const source: DraftSource = { request, selected: requestSelection.current };
    lastRequest.current = request;
    setMessages((old) => [...old, { role: "user", text: request.prompt }]);
    setPrompt("");
    try {
      const result = await askInventoryAssistant(request);
      if (!result.ok) { setPrompt(request.prompt); setError(result.message, result.code); return; }
      setNotices([]);
      applyReply(result.data, source);
    } catch {
      setPrompt(request.prompt);
      setError("Не вдалося отримати відповідь. Ваш запит не втрачено.", "PROVIDER_UNAVAILABLE");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  function applyReply(reply: AssistantReply, source: DraftSource | null) {
    setMutation(null);
    setBatch(null);
    setAssumptions([]);
    setPendingWrite(null);
    setDraftStatus("ready");
    lastWrite.current = null;
    draftSource.current = reply.operation === "mutation" || reply.operation === "batch" || reply.operation === "chooseRecord" ? source : null;
    if (reply.operation !== "noChanges") setMessages((old) => [...old, { role: "assistant", text: reply.message }]);
    if ((reply.operation === "batch" || reply.operation === "mutation") && reply.resolved) lastWrite.current = reply.resolved;
    setClarification(reply.operation === "clarify" ? reply.clarification : null);
    if (reply.operation === "noChanges") {
      setNeutral(reply.message);
    } else if (reply.operation === "search") {
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
    } else if (reply.operation === "chooseRecord") {
      setPendingWrite(reply);
      lastWrite.current = reply.pending;
      setSelected(null);
    }
  }

  async function resumeWrite(choice: ResumeWrite["choice"] = null, page: ResumeWrite["page"] = null, saved = pendingWrite?.pending) {
    if (pending.current || !saved) return;
    pending.current = true;
    setPhase("preparing");
    setError("");
    const source = draftSource.current;
    if (source) {
      lastRequest.current = source.request;
      requestSelection.current = source.selected;
    }
    try {
      const response = await resumeInventoryWrite({ pending: saved, choice, page });
      if (!response.ok) { setError(response.message, response.code); return; }
      applyReply(response.data, source);
    } catch {
      setError("Не вдалося підготувати перегляд. Вибір і решту запиту збережено для повторної спроби.");
    } finally { pending.current = false; setPhase("idle"); }
  }

  function prepareAgain() {
    if (pending.current || draftStatus === "uncertain") return;
    if (mutation?.kind === "createIngredient" || mutation?.kind === "createStuff") {
      const original = lastWrite.current?.command;
      const sameTitle = original?.kind === "mutation" && (original.intent.kind === "createIngredient" || original.intent.kind === "createStuff") && original.intent.data.title === mutation.after.title;
      const intent = mutation.kind === "createIngredient" ? { kind: mutation.kind, data: mutation.after } : { kind: mutation.kind, data: mutation.after };
      // Revalidate the edited values, not the original prompt/defaults. A renamed
      // ingredient must go through duplicate review for its new name again.
      void resumeWrite(null, null, {
        command: { kind: "mutation", intent }, selected: lastWrite.current?.selected ?? null,
        assumptions, decisions: sameTitle && lastWrite.current ? lastWrite.current.decisions : [],
      });
    } else if (lastWrite.current) void resumeWrite(null, null, lastWrite.current);
    else if (lastRequest.current) void requestProposal(lastRequest.current);
  }

  async function selectRecord(record: InventoryResult) {
    if (pending.current) return;
    pending.current = true;
    setPhase("loading");
    setError("");
    try {
      const result = await getInventoryRecord({ entity: record.entity, id: record.id });
      if (!result.ok) { setError(result.message, result.code); setSelected(null); return; }
      lastWrite.current = null;
      draftSource.current = null;
      setDraftStatus("ready");
      setPendingWrite(null);
      setMutation(null);
      setClarification(null);
      setBatch(null);
      setAssumptions([]);
      setSelected(result.data);
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
    if (pending.current || draftStatus !== "ready" || (!mutation && !batch)) return;
    pending.current = true;
    setPhase("saving");
    setError("");
    if (draftSource.current) {
      lastRequest.current = draftSource.current.request;
      requestSelection.current = draftSource.current.selected;
    }
    try {
      const result = await confirmInventoryBatch(batch ?? { items: [mutation!], unchanged: [] });
      if (!result.ok) {
        const code = confirmationFailure(result.code);
        setDraftStatus(code === "SAVE_UNCERTAIN" ? "uncertain" : code === "STALE_PREVIEW" ? "stale" : "invalid");
        setError(code === "SAVE_UNCERTAIN" ? "Не вдалося отримати результат збереження." : result.message, code);
        return;
      }
      setBatch(null);
      setMutation(null);
      setPendingWrite(null);
      setAssumptions([]);
      setDraftStatus("ready");
      lastWrite.current = null;
      draftSource.current = null;
      const written = result.data.results;
      refreshTargets.current = written;
      setNotices(written);
      await refreshSavedData(written);
    } catch {
      setDraftStatus("uncertain");
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

      {results && !pendingWrite && <InventorySearchView results={results} selected={selected} busy={busy} onSelect={selectRecord} onMore={loadMore} />}
      {pendingWrite && <RecordChoiceView question={pendingWrite.question} prompt={draftSource.current?.request.clarification?.originalPrompt ?? draftSource.current?.request.prompt ?? ""} busy={busy} onChoose={(selection) => { void resumeWrite({ key: pendingWrite.question.key, selection }); }} onCreateNew={() => { void resumeWrite({ key: pendingWrite.question.key, createNew: true }); }} onPage={(number) => { void resumeWrite(null, { key: pendingWrite.question.key, number }); }} onCancel={cancelWrite} />}
      {selected && <InventoryRecordView record={selected} busy={busy} onClear={() => { setSelected(null); setClarification(null); cancelWrite(); }} />}
      {mutation && <InventoryMutationView preview={mutation} assumptions={assumptions} busy={busy} status={draftStatus} onChange={setMutation} onConfirm={confirmMutation} onPrepare={draftStatus === "uncertain" ? undefined : prepareAgain} onCancel={cancelWrite} />}
      {batch && <InventoryBatchView preview={batch} assumptions={assumptions} busy={busy} status={draftStatus} onConfirm={confirmMutation} onPrepare={draftStatus === "uncertain" ? undefined : prepareAgain} onCancel={cancelWrite} />}

      {notices.length > 0 && <div role="status" className="space-y-2 rounded-xl border p-4"><p className="font-medium">Виконано операцій: {notices.length}</p><ul className="space-y-1">{notices.map((notice, index) => <li key={index}>{notice.operation === "deleted" ? "Видалено" : notice.operation === "created" ? "Створено" : "Оновлено"}: {notice.operation === "deleted" ? notice.title : <Link className="underline" href={notice.entity === "ingredient" ? frontendUrls.ingredients.view(notice.id) : notice.entity === "recipe" ? frontendUrls.recipes.view(notice.id) : frontendUrls.stuff.view(notice.id)}>{notice.title}</Link>}</li>)}</ul></div>}
      {neutral && <div role="status" className="rounded-xl border bg-muted/40 p-4 text-sm">{neutral}</div>}
      {error && <AssistantErrorPanel error={error} code={errorCode} busy={busy} canEdit={lastRequest.current !== null} showInspectionLinks={draftStatus !== "uncertain" || (!mutation && !batch)} onEdit={editRequest} onPrepare={prepareAgain} onRefresh={retryRefresh} />}
      {busy && <p role="status" aria-live="polite" className="text-muted-foreground">{requestPhaseLabels[phase]}</p>}

      {clarification && <section aria-label="Уточнення запиту" className="space-y-2 rounded-lg border p-4">
        <p className="font-medium">{clarification.question}</p>
        <p className="text-sm text-muted-foreground">Відповідь нижче продовжить попередній запит. Ще нічого не збережено.</p>
        <details className="text-sm"><summary className="cursor-pointer">Запит, який уточнюємо</summary><p className="mt-2 whitespace-pre-wrap break-words">{clarification.originalPrompt}</p></details>
        <Button type="button" variant="outline" disabled={busy} onClick={() => { setClarification(null); setError(""); }}>Скасувати уточнення</Button>
      </section>}

      <AssistantContext selected={selected} previousSearch={previousSearch} />


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
