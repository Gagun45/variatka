"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import { previewPresentation, previewActionLabels } from "@/lib/ai/preview-summary";
import { draftStatusMessages, type DraftStatus } from "@/lib/ai/request-state";
import InventoryPreviewCard from "./InventoryPreviewCard";
import InventoryInspectionLinks from "./InventoryInspectionLinks";


export default function InventoryBatchView({ preview, assumptions, busy, status = "ready", onConfirm, onPrepare, onCancel }: { preview: BatchPreview; assumptions: string[]; busy: boolean; status?: DraftStatus; onConfirm: () => void; onPrepare?: () => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [preview]);
  const multiple = preview.items.length > 1;
  const presentation = previewPresentation(preview.items);
  const deleting = preview.items.some((item) => mutationDefinitions[item.kind].action === "delete");
  const ready = status === "ready";
  const submitLabel = busy
    ? ready ? "Збереження…" : "Підготовка…"
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
  return <form onSubmit={(event) => { event.preventDefault(); if (busy) return; if (status === "ready") onConfirm(); else if (status !== "uncertain") onPrepare?.(); }} className="min-w-0 space-y-4 rounded-xl border border-primary p-3 sm:p-5">
    <h2 ref={heading} tabIndex={-1} className="rounded text-xl font-semibold focus-visible:outline-2 focus-visible:outline-ring">{presentation.heading}</h2>
    {multiple && <div className="flex flex-wrap gap-2 text-sm" aria-label="Підсумок операцій">
      {Object.entries(counts).map(([action, count]) => count > 0 && <span key={action} className={`rounded-md px-2 py-1 ${action === "delete" ? "bg-destructive/10 font-semibold text-destructive" : "bg-muted"}`}>{previewActionLabels[action as keyof typeof counts]}: {count}</span>)}
      {preview.unchanged.length > 0 && <span className="rounded-md bg-muted px-2 py-1">Без змін: {preview.unchanged.length}</span>}
    </div>}
    <p className="text-sm text-muted-foreground">{status !== "ready" ? draftStatusMessages[status] : multiple ? "Ще нічого не збережено. Буде виконано весь пакет або жодної зміни. Операції показані в порядку виконання." : "Ще нічого не збережено. Перевірте запропоновану операцію."}</p>
    {status === "uncertain" && <InventoryInspectionLinks />}
    {multiple && <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground" aria-label="Типи записів у пакеті">{Object.entries(inventoryEntityLabels).map(([entity, label]) => {
      const count = preview.items.filter((item) => mutationDefinitions[item.kind].entity === entity).length;
      return count > 0 ? <li key={entity}>{label}: {count}</li> : null;
    })}</ul>}
    {deleting && <p className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm font-medium text-destructive">Відновлення після видалення через помічника немає. Перевірте записи з позначкою «Видалення».</p>}
    {assumptions.length > 0 && <details className="rounded-lg bg-muted p-3" open><summary className="cursor-pointer font-medium">Запропоновані значення</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{assumptions.map((item, index) => <li className="break-words" key={index}>{item}</li>)}</ul></details>}
    {preview.unchanged.length > 0 && <details className="rounded-lg border p-3 text-sm"><summary className="cursor-pointer">Без змін · {preview.unchanged.length}</summary><ul className="mt-2 list-disc pl-5">{preview.unchanged.map((title, index) => <li className="break-words" key={index}>{title}</li>)}</ul></details>}
    <ol className="space-y-3">{preview.items.map((item, index) => <li key={`${item.kind}:${index}`}><InventoryPreviewCard item={item} number={multiple ? index + 1 : undefined} recipes={item.kind === "createIngredient" ? dependencies.get(item.after.title.toLocaleLowerCase("uk")) : undefined} /></li>)}</ol>
    <div className={multiple ? "sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-lg" : "flex flex-wrap items-center justify-between gap-3"}>
      {multiple && <p className="w-full text-sm font-medium">{ready ? "До виконання" : "Операцій у пропозиції"}: {preview.items.length}{deleting ? ` · Видалень: ${counts.delete}` : ""}</p>}
      <Button className="min-h-11" disabled={busy} type="button" variant="outline" onClick={onCancel}>{status === "uncertain" ? "Прибрати пропозицію" : "Скасувати"}</Button>
      {status !== "uncertain" && <Button className="min-h-11 flex-1 whitespace-normal sm:flex-none" disabled={busy || (!ready && !onPrepare)} type="submit" variant={ready && deleting ? "destructive" : "default"}>{submitLabel}</Button>}
    </div>
  </form>;
}
