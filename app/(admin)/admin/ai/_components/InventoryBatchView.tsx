"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import { previewPresentation, previewActionLabels } from "@/lib/ai/preview-summary";
import { draftStatusMessages, type DraftStatus } from "@/lib/ai/request-state";
import InventoryPreviewCard from "./InventoryPreviewCard";
import InventoryInspectionLinks from "./InventoryInspectionLinks";


export default function InventoryBatchView({ preview, assumptions, busy, status = "ready", autoFocus = true, onConfirm, onPrepare, onCancel }: { preview: BatchPreview; assumptions: string[]; busy: boolean; status?: DraftStatus; autoFocus?: boolean; onConfirm: () => void; onPrepare?: () => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (autoFocus) heading.current?.focus(); }, [preview, autoFocus]);
  const multiple = preview.items.length > 1;
  const presentation = previewPresentation(preview.items);
  const deleting = preview.items.some((item) => mutationDefinitions[item.kind].action === "delete");
  const ready = status === "ready";
  const submitLabel = busy
    ? "Зачекайте…"
    : ready ? presentation.confirmation : "Підготувати новий перегляд";
  const counts = { create: 0, update: 0, delete: 0 };
  const dependencies = new Map<string, string[]>();
  for (const item of preview.items) {
    counts[mutationDefinitions[item.kind].action]++;
    if (item.kind === "createRecipe" || item.kind === "updateRecipe") for (const ingredient of item.after.ingredients) if (ingredient.id === null) {
      const key = ingredient.title.toLocaleLowerCase("uk");
      const recipes = dependencies.get(key) ?? [];
      if (!recipes.includes(item.after.fields.title)) recipes.push(item.after.fields.title);
      dependencies.set(key, recipes);
    }
  }
  return <form onSubmit={(event) => { event.preventDefault(); if (busy) return; if (status === "ready") onConfirm(); else if (status !== "uncertain") onPrepare?.(); }} className="min-w-0 space-y-4 rounded-2xl border bg-card p-4 shadow-surface sm:p-6">
    <h2 ref={heading} tabIndex={-1} className="rounded text-lg font-semibold focus-visible:outline-2 focus-visible:outline-ring">{multiple ? "Запропоновані зміни" : presentation.heading}</h2>
    {multiple && <div className="flex flex-wrap gap-2 text-sm" aria-label="Підсумок операцій">
      {Object.entries(counts).map(([action, count]) => count > 0 && <span key={action} className={`rounded-md px-2 py-1 ${action === "delete" ? "bg-destructive/10 font-semibold text-destructive" : "bg-muted"}`}>{previewActionLabels[action as keyof typeof counts]}: {count}</span>)}
      {preview.unchanged.length > 0 && <span className="rounded-md bg-muted px-2 py-1">Без змін: {preview.unchanged.length}</span>}
    </div>}
    <p className="text-sm leading-relaxed text-muted-foreground">{status !== "ready" ? draftStatusMessages[status] : multiple ? "Перевірте всі зміни. Їх буде збережено разом." : "Перевірте зміни перед збереженням."}</p>
    {status === "uncertain" && <InventoryInspectionLinks />}
    {deleting && <p className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm font-medium text-destructive">Відновлення після видалення через помічника немає. Перевірте записи з позначкою «Видалення».</p>}
    {assumptions.length > 0 && <details className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm"><summary className="cursor-pointer text-muted-foreground">Як заповнено поля</summary><p className="mt-2 text-xs text-muted-foreground">Це початкові припущення. Актуальні значення показано в пропозиції нижче.</p><ul className="mt-2 list-disc space-y-1 pl-5">{assumptions.map((item, index) => <li className="break-words" key={index}>{item}</li>)}</ul></details>}
    {preview.unchanged.length > 0 && <details className="rounded-lg border p-3 text-sm"><summary className="cursor-pointer">Без змін · {preview.unchanged.length}</summary><ul className="mt-2 list-disc pl-5">{preview.unchanged.map((title, index) => <li className="break-words" key={index}>{title}</li>)}</ul></details>}
    <ol className="space-y-3">{preview.items.map((item, index) => <li key={`${item.kind}:${index}`}><InventoryPreviewCard item={item} framed={multiple} number={multiple ? index + 1 : undefined} recipes={item.kind === "createIngredient" ? dependencies.get(item.after.title.toLocaleLowerCase("uk")) : undefined} /></li>)}</ol>
    <div className={multiple ? "sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-raised backdrop-blur-sm" : "flex flex-wrap items-center justify-between gap-3 border-t pt-4"}>
      {multiple && <p className="w-full text-sm font-medium">{ready ? "До виконання" : "Операцій у пропозиції"}: {preview.items.length}{deleting ? ` · Видалень: ${counts.delete}` : ""}</p>}
      <Button className="min-h-11" disabled={busy} type="button" variant="outline" onClick={onCancel}>{status === "uncertain" ? "Прибрати пропозицію" : "Скасувати"}</Button>
      {status !== "uncertain" && <Button className="min-h-11 flex-1 whitespace-normal sm:flex-none" disabled={busy || (!ready && !onPrepare)} type="submit" variant={ready && deleting ? "destructive" : "default"}>{submitLabel}</Button>}
    </div>
  </form>;
}
