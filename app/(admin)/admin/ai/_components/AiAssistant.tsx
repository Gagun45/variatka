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
import type { AssistantReply, InventoryRecord, InventoryResult, InventorySearchResult, MutationResult, SelectionExpiry } from "@/lib/ai/inventory.types";
import { sameSelection } from "@/lib/ai/clarification";
import AssistantContext from "./AssistantContext";
import AssistantErrorPanel from "./AssistantErrorPanel";
import InventoryBatchView from "./InventoryBatchView";
import { refreshAfterSave } from "@/lib/ai/refresh-after-save";
import { confirmationFailure, requestPhaseLabels, type AssistantErrorCode, type DraftStatus, type RequestPhase } from "@/lib/ai/request-state";
import type { AssistantRequest } from "@/zod/ai-search.schema";
import { activeTaskLabel, activeTaskTargets, editTaskCreation, incompleteTaskFields, taskUsesSelection, type ActiveTask, type TaskSource } from "@/lib/ai/active-task";
import type { Clarification, InventorySearch } from "@/zod/ai-search.schema";
import { InventoryRecordView, InventorySearchView } from "./InventorySearchView";
import InventoryMutationView from "./InventoryMutationView";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";

type Message = { role: "user" | "assistant"; text: string; operation?: AssistantReply["operation"] };

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
  const refreshSelection = useRef<InventoryRecord | null>(null);
  function setError(message: string, code: AssistantErrorCode = "VALIDATION_ERROR") {
    setNeutral("");
    if (code === "NO_CHANGES") { setNeutral(message); setErrorMessage(""); return; }
    setErrorMessage(message);
    setErrorCode(code);
  }
  const [results, setResults] = useState<InventorySearchResult | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [recordExpanded, setRecordExpanded] = useState(false);
  const [selectionExpiry, setSelectionExpiry] = useState<SelectionExpiry | null>(null);
  const expiredSelections = useRef(new Set<string>());
  const [initialClarification, setInitialClarification] = useState<Clarification | null>(null);
  const [previousSearch, setPreviousSearch] = useState<InventorySearch | null>(null);
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const mutation = activeTask?.view.kind === "mutation" ? activeTask.view.preview : null;
  const batch = activeTask?.view.kind === "batch" ? activeTask.view.preview : null;
  const pendingWrite = activeTask?.view.kind === "choice" ? activeTask.view.reply : null;
  const clarification = activeTask?.clarification ?? initialClarification;
  const draftStatus = activeTask?.clarification && activeTask.status === "ready" ? "invalid" : activeTask?.status ?? "ready";
  const assumptions = activeTask?.pending.assumptions ?? [];
  const [notices, setNotices] = useState<MutationResult[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);
  const queryClient = useQueryClient();
  const lastMessage = messages.at(-1);
  const latestRequest = [...messages].reverse().find((message) => message.role === "user");
  const inlineReply = lastMessage?.role === "assistant" && (
    lastMessage.operation === "unsupported" ||
    (lastMessage.operation === "keepTask" && activeTask) ||
    (lastMessage.operation === "viewSelected" && selected)
  ) ? lastMessage.text : null;
  const showPreviousResults = Boolean(activeTask || clarification || selected || inlineReply);

  function setDraftStatus(status: DraftStatus) {
    setActiveTask((task) => task ? { ...task, status } : null);
  }

  function setMutation(preview: InventoryMutationPreview) {
    setActiveTask((task) => task ? editTaskCreation(task, preview) : null);
  }

  function clearClarification() {
    setInitialClarification(null);
    setActiveTask((task) => task ? { ...task, clarification: null } : null);
  }

  function knownExpired(record: InventoryResult | null) {
    return Boolean(record && expiredSelections.current.has(`${record.entity}:${record.id}`));
  }

  function expireSelection(notice: SelectionExpiry) {
    expiredSelections.current.add(`${notice.selection.entity}:${notice.selection.id}`);
    setSelectionExpiry(notice);
    setSelected((current) => sameSelection(current, notice.selection) ? null : current);
    setActiveTask((task) => task && task.status !== "uncertain" && taskUsesSelection(task, notice.selection) ? { ...task, status: "stale" } : task);
    if (sameSelection(requestSelection.current, notice.selection)) requestSelection.current = null;
  }

  function newRequest() {
    if (pending.current) return;
    setPrompt("");
    lastRequest.current = null;
    requestSelection.current = null;
    refreshTargets.current = [];
    refreshSelection.current = null;
    setMessages([]);
    setError("");
    setResults(null);
    setSelected(null);
    setRecordExpanded(false);
    setSelectionExpiry(null);
    expiredSelections.current.clear();
    setInitialClarification(null);
    setPreviousSearch(null);
    setActiveTask(null);
    setNotices([]);
    inputRef.current?.focus();
  }

  function cancelWrite() {
    setActiveTask(null);
    setInitialClarification(null);
    setError("");
  }

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !prompt.trim()) return;
    await requestProposal({
      prompt: prompt.trim(), selected: selected ? { entity: selected.entity, id: selected.id } : null, previousSearch, clarification,
      activeWrite: activeTask && activeTask.status !== "uncertain" ? { pending: activeTask.pending, incompleteFields: incompleteTaskFields(activeTask), phase: activeTask.clarification ? "clarification" : activeTask.view.kind === "choice" ? "choice" : activeTask.view.kind === "blocked" ? "blocked" : "draft" } : null,
    });
  }

  function editRequest() {
    if (pending.current || !lastRequest.current) return;
    const request = lastRequest.current;
    setPrompt(request.prompt);
    setSelected(knownExpired(requestSelection.current) ? null : requestSelection.current);
    setPreviousSearch(request.previousSearch);
    if (!activeTask?.clarification) setInitialClarification(request.clarification);
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
    const source: TaskSource = { request: { ...request, activeWrite: null }, selected: requestSelection.current };
    lastRequest.current = request;
    setMessages((old) => [...old, { role: "user", text: request.prompt }]);
    setPrompt("");
    try {
      const result = await askInventoryAssistant(request);
      if (!result.ok) { setPrompt(request.prompt); setError(result.message, result.code); return; }
      setNotices([]);
      applyReply(result.data, result.data.continuesTask && activeTask ? activeTask.source : source);
    } catch {
      setPrompt(request.prompt);
      setError("Не вдалося отримати відповідь. Ваш запит не втрачено.", "PROVIDER_UNAVAILABLE");
    } finally {
      pending.current = false;
      setPhase("idle");
    }
  }

  function applyReply(reply: AssistantReply, source: TaskSource | null) {
    if (reply.selectionExpired) expireSelection(reply.selectionExpired);
    if (reply.operation === "requestBlocked") {
      setPrompt(lastRequest.current?.prompt ?? "");
      setError(reply.message, reply.code);
      return;
    }
    if (reply.operation === "writeBlocked") {
      setPrompt(lastRequest.current?.prompt ?? "");
      // A failed independent replacement must not discard the prior edited task.
      if (!source || (activeTask && !reply.continuesTask)) {
        setError(reply.message, reply.code);
        return;
      }
      setInitialClarification(null);
      setActiveTask({ pending: reply.pending, source, status: "invalid", clarification: null, view: { kind: "blocked", message: reply.message } });
      setError("");
      return;
    }
    if (reply.operation !== "noChanges" && reply.operation !== "revisionFailed") setMessages((old) => [...old, { role: "assistant", text: reply.message, operation: reply.operation }]);
    if (reply.operation === "keepTask") return;
    if (reply.operation === "clarifyRevision") {
      setActiveTask((task) => task ? { ...task, clarification: reply.clarification } : null);
      return;
    }
    if (reply.operation === "revisionFailed") {
      setActiveTask((task) => {
        if (!task) return null;
        const revised: ActiveTask = { ...task, pending: reply.pending, clarification: null, status: reply.code === "STALE_PREVIEW" ? "stale" : "invalid" };
        const command = reply.pending.command;
        if (reply.revisionApplied && task.view.kind === "mutation" && command.kind === "mutation") {
          const intent = command.intent;
          if (intent.kind === "createIngredient") return editTaskCreation(revised, { kind: intent.kind, after: intent.data });
          if (intent.kind === "createStuff") return editTaskCreation(revised, { kind: intent.kind, after: intent.data });
        }
        return revised;
      });
      setPrompt(lastRequest.current?.prompt ?? "");
      setError(reply.message, reply.code);
      return;
    }
    setInitialClarification(reply.operation === "clarify" ? reply.clarification : null);
    setRecordExpanded(reply.operation === "viewSelected");
    if ((reply.operation === "mutation" || reply.operation === "batch" || reply.operation === "chooseRecord") && source) {
      setActiveTask({
        source, status: "ready", clarification: null,
        pending: reply.operation === "chooseRecord" ? reply.pending : reply.resolved,
        view: reply.operation === "chooseRecord" ? { kind: "choice", reply } : reply.operation === "mutation" ? { kind: "mutation", preview: reply.preview } : { kind: "batch", preview: reply.preview },
      });
    } else setActiveTask(null);
    if (reply.operation === "noChanges") {
      setNeutral(reply.message);
    } else if (reply.operation === "search") {
      setResults(reply.results);
      setPreviousSearch(reply.results.search);
      setSelected(null);
    } else if (reply.operation === "viewSelected") {
      setSelected(reply.record);
    }
  }

  async function resumeWrite(choice: ResumeWrite["choice"] = null, page: ResumeWrite["page"] = null, saved: PendingWrite | undefined = activeTask?.pending) {
    if (pending.current || !saved || activeTask?.clarification) return;
    pending.current = true;
    setPhase("preparing");
    setError("");
    const source = activeTask?.source ?? null;
    if (source) {
      lastRequest.current = source.request;
      requestSelection.current = source.selected;
    }
    try {
      const response = await resumeInventoryWrite({ pending: saved, choice, page });
      if (!response.ok) {
        if (response.code === "STALE_PREVIEW") setDraftStatus("stale");
        setError(response.message, response.code);
        return;
      }
      applyReply(response.data, source);
    } catch {
      setError("Не вдалося підготувати перегляд. Вибір і решту запиту збережено для повторної спроби.");
    } finally { pending.current = false; setPhase("idle"); }
  }

  function prepareAgain() {
    if (pending.current || draftStatus === "uncertain" || activeTask?.clarification) return;
    if (activeTask && incompleteTaskFields(activeTask).length) {
      setError("Заповніть назву та коректний залишок у пропозиції або надішліть уточнення з цими значеннями.");
      return;
    }
    if (activeTask) void resumeWrite(null, null, activeTask.pending);
    else if (lastRequest.current) void requestProposal(lastRequest.current);
  }

  async function selectRecord(record: InventoryResult) {
    if (pending.current) return;
    pending.current = true;
    setPhase("loading");
    setError("");
    try {
      const result = await getInventoryRecord({ entity: record.entity, id: record.id });
      if (!result.ok) {
        if (result.code === "NOT_FOUND") expireSelection({ selection: record, message: "Цей запис більше не існує. Оновіть пошук та оберіть інший запис." });
        else setError(result.message, result.code);
        return;
      }
      setActiveTask(null);
      setInitialClarification(null);
      setSelected(result.data);
      setRecordExpanded(false);
      setSelectionExpiry(null);
      expiredSelections.current.delete(`${result.data.entity}:${result.data.id}`);
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
    }, refreshSelection.current);
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
    if (pending.current || draftStatus !== "ready" || (!mutation && !batch) || (activeTask && incompleteTaskFields(activeTask).length)) return;
    pending.current = true;
    setPhase("saving");
    setError("");
    if (activeTask) {
      lastRequest.current = activeTask.source.request;
      requestSelection.current = activeTask.source.selected;
    }
    try {
      const result = await confirmInventoryBatch(batch ?? { items: [mutation!], unchanged: [] });
      if (!result.ok) {
        const code = confirmationFailure(result.code);
        setDraftStatus(code === "SAVE_UNCERTAIN" ? "uncertain" : code === "STALE_PREVIEW" ? "stale" : "invalid");
        setError(code === "SAVE_UNCERTAIN" ? "Не вдалося отримати результат збереження." : result.message, code);
        return;
      }
      setActiveTask(null);
      const written = result.data.results;
      refreshTargets.current = written;
      refreshSelection.current = selected;
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

  const searchView = results && !pendingWrite ? <InventorySearchView results={results} selected={selected} busy={busy} onSelect={selectRecord} onMore={loadMore} /> : null;
  const previewView = mutation ? <InventoryMutationView preview={mutation} assumptions={assumptions} busy={busy} status={draftStatus} autoFocus={!activeTask?.clarification} onChange={setMutation} onConfirm={confirmMutation} onPrepare={draftStatus === "uncertain" || activeTask?.clarification ? undefined : prepareAgain} onCancel={cancelWrite} /> : batch ? <InventoryBatchView preview={batch} assumptions={assumptions} busy={busy} status={draftStatus} autoFocus={!activeTask?.clarification} onConfirm={confirmMutation} onPrepare={draftStatus === "uncertain" || activeTask?.clarification ? undefined : prepareAgain} onCancel={cancelWrite} /> : null;
  const clarificationView = clarification && <section aria-label="Уточнення запиту" aria-live="polite" className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
    <p className="text-xs font-medium text-primary">Потрібне уточнення</p>
    <h2 className="font-semibold leading-relaxed">{clarification.question}</h2>
    <details className="text-sm text-muted-foreground"><summary className="cursor-pointer">Запит, який уточнюємо</summary><p className="mt-2 whitespace-pre-wrap break-words">{clarification.originalPrompt}</p></details>
    <Button type="button" variant="ghost" className="min-h-10 px-0 text-muted-foreground" disabled={busy} onClick={() => { clearClarification(); setError(""); }}>Скасувати уточнення</Button>
  </section>;
  const renderNotice = (notice: MutationResult, index: number) => <li key={index} className="break-words text-sm">{notice.operation === "deleted" ? "Видалено" : notice.operation === "created" ? "Створено" : "Оновлено"}: {notice.operation === "deleted" ? notice.title : <Link className="underline decoration-current/30 underline-offset-4 hover:decoration-current" href={notice.entity === "ingredient" ? frontendUrls.ingredients.view(notice.id) : notice.entity === "recipe" ? frontendUrls.recipes.view(notice.id) : frontendUrls.stuff.view(notice.id)}>{notice.title}</Link>}</li>;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 space-y-0 px-4 py-6 sm:px-6 sm:py-8" lang="uk">
      <header className="flex items-center justify-between gap-4 pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold tracking-tight text-primary sm:flex">AI</span>
          <div><h1 className="text-xl font-semibold sm:text-2xl">AI-помічник</h1><p className="text-sm text-muted-foreground">Пошук і зміни в інвентарі</p></div>
        </div>
        <Button type="button" variant="ghost" className="min-h-10 shrink-0 gap-2 text-muted-foreground" disabled={busy} onClick={newRequest}>
          <MessageSquarePlus aria-hidden="true" />
          Новий чат
        </Button>
      </header>


      {latestRequest && <details className="rounded-xl bg-muted/50 px-4 py-3 text-sm">
        <summary className="flex cursor-pointer items-center gap-3"><span className="shrink-0 text-xs font-medium text-muted-foreground">Ваш запит</span><span className="min-w-0 flex-1 truncate">{latestRequest.text}</span><span aria-hidden="true" className="shrink-0 text-muted-foreground">⌄</span></summary>
        <p className="mt-3 whitespace-pre-wrap break-words border-t pt-3 leading-relaxed">{latestRequest.text}</p>
      </details>}
      {inlineReply && <p role="status" className="rounded-xl border-l-2 border-primary/40 bg-primary/5 px-4 py-3 text-sm leading-relaxed">{inlineReply}</p>}

      {selectionExpiry && <section role="status" aria-label="Вибір запису недоступний" className="space-y-2 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
        <p>{selectionExpiry.message}</p>
        <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.focus()}>Ввести назву або пошук</Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => setSelectionExpiry(null)}>Приховати повідомлення</Button>
      </section>}
      {!showPreviousResults && searchView}
      {clarificationView}
      {pendingWrite && <RecordChoiceView question={pendingWrite.question} prompt={activeTask?.source.request.clarification?.originalPrompt ?? activeTask?.source.request.prompt ?? ""} busy={busy || Boolean(activeTask?.clarification)} onChoose={(selection) => { void resumeWrite({ key: pendingWrite.question.key, selection }); }} onCreateNew={() => { void resumeWrite({ key: pendingWrite.question.key, createNew: true }); }} onPage={(number) => { void resumeWrite(null, { key: pendingWrite.question.key, number }); }} onCancel={cancelWrite} />}
      {selected && <InventoryRecordView record={selected} busy={busy} expanded={recordExpanded} onExpandedChange={setRecordExpanded} onClear={() => { setSelected(null); clearClarification(); cancelWrite(); }} />}
      {activeTask?.view.kind === "blocked" && <section aria-label="Видалення заблоковано" className="space-y-3">
        <AssistantErrorPanel error={activeTask.view.message} code="CONFLICT" busy={busy} canEdit={lastRequest.current !== null} onEdit={editRequest} onPrepare={prepareAgain} onRefresh={retryRefresh} />
        <p className="text-sm text-muted-foreground">Виправте запит або перевірте знову після зміни пов’язаних записів.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={busy || Boolean(activeTask.clarification)} onClick={prepareAgain}>Перевірити знову</Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={cancelWrite}>Скасувати завдання</Button>
        </div>
      </section>}
      {activeTask?.clarification && previewView ? <details className="rounded-xl border bg-card/50 p-3 text-sm"><summary className="cursor-pointer px-1 font-medium text-muted-foreground">Пропозиція, яку уточнюємо</summary><div className="mt-3">{previewView}</div></details> : previewView}

      {notices.length > 0 && <div role="status" className="space-y-2 rounded-2xl border border-success/20 bg-success/5 p-4"><p className="font-medium text-success">Зміни збережено · {notices.length}</p><ul className="space-y-1">{notices.slice(0, 3).map(renderNotice)}</ul>{notices.length > 3 && <details className="pt-1 text-sm"><summary className="cursor-pointer text-muted-foreground">Ще {notices.length - 3}</summary><ul className="mt-2 space-y-1">{notices.slice(3).map(renderNotice)}</ul></details>}</div>}
      {neutral && <div role="status" className="rounded-xl bg-muted/60 px-4 py-3 text-sm">{neutral}</div>}
      {error && <AssistantErrorPanel error={error} code={errorCode} busy={busy} canEdit={lastRequest.current !== null} showPrepare={!mutation && !batch} showInspectionLinks={draftStatus !== "uncertain" || (!mutation && !batch)} onEdit={editRequest} onPrepare={prepareAgain} onRefresh={retryRefresh} />}

      {showPreviousResults && searchView && <details className="rounded-xl border bg-card/50 p-3 text-sm"><summary className="cursor-pointer px-1 font-medium text-muted-foreground">Попередні результати · {results?.items.length}</summary><div className="mt-3">{searchView}</div></details>}
      {messages.length > 0 && <details className="text-sm">
        <summary className="cursor-pointer py-2 text-muted-foreground">Історія запитів · {messages.filter((message) => message.role === "user").length}</summary>
        <div role="log" aria-label="Історія повідомлень" aria-live="off" className="mt-2 max-h-80 space-y-4 overflow-y-auto rounded-xl border bg-muted/30 p-4">
          {messages.map((message, index) => <div key={index} className="whitespace-pre-wrap break-words text-sm leading-relaxed"><p className="mb-1 text-xs font-medium text-muted-foreground">{message.role === "user" ? "Ви" : "Помічник"}</p>{message.text}</div>)}
          <AssistantContext selected={selected} previousSearch={previousSearch} />
        </div>
      </details>}

      <form onSubmit={propose} className="space-y-3 rounded-2xl border bg-card p-4 shadow-surface transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 sm:p-5">
        {activeTask && <section aria-label="Поточне завдання" className="space-y-1 border-b pb-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">{activeTaskLabel(activeTask)}</p>
          <p className="break-words font-medium">{activeTaskTargets(activeTask)}</p>
        </section>}
        <label htmlFor="ai-prompt" className="block text-sm font-medium">{clarification ? "Ваша відповідь" : activeTask && activeTask.status !== "uncertain" ? "Уточнення або новий запит" : "Ваш запит"}</label>
        <Textarea ref={inputRef} id="ai-prompt" required rows={3} maxLength={12000} disabled={busy} className="min-h-24 resize-y border-0 bg-transparent p-0 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-base dark:bg-transparent" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={clarification ? "Напишіть відповідь…" : activeTask && activeTask.status !== "uncertain" ? "Уточніть пропозицію або опишіть інше завдання…" : "Знайдіть запис або опишіть, що потрібно змінити…"} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role={busy ? "status" : undefined} aria-live="polite" className="min-w-0 flex-1 text-xs text-muted-foreground">{busy ? requestPhaseLabels[phase] : activeTask ? "" : "Зміни — лише після підтвердження"}</p>
          <Button type="submit" className="min-h-11 gap-2 rounded-xl px-5" disabled={busy || !prompt.trim()}>
            Надіслати
            <Send aria-hidden="true" />
          </Button>
        </div>
      </form>
    </main>
  );
}
