"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import { previewSummary, snapshotRows } from "@/lib/ai/preview-summary";

const actionLabels = { create: "Створення", update: "Оновлення", delete: "Видалення" };

function Snapshot({ item }: { item: InventoryMutationPreview }) {
  // Reuse the same read-only rows for full snapshots, including unchanged fields.
  const before = "before" in item ? item.before : null;
  const after = "after" in item ? item.after : null;
  return <div className="grid min-w-0 gap-4 sm:grid-cols-2">{[before, after].map((snapshot, index) => snapshot && <div key={index} className="min-w-0">
    <h4 className="mb-2 font-medium">{index === 0 ? "Було" : "Буде"}</h4>
    <dl className="space-y-2 text-sm">{snapshotRows(snapshot).map((row) => <div key={row.label} className="min-w-0"><dt className="text-muted-foreground">{row.label}</dt><dd className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{row.after ?? row.before}</dd></div>)}</dl>
  </div>)}</div>;
}

export default function InventoryBatchView({ preview, assumptions, busy, onConfirm, onCancel }: { preview: BatchPreview; assumptions: string[]; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [preview]);
  const deleting = preview.items.some((item) => mutationDefinitions[item.kind].action === "delete");
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
  return <form onSubmit={(event) => { event.preventDefault(); onConfirm(); }} className="min-w-0 space-y-4 rounded-xl border border-primary p-3 sm:p-5">
    <h2 ref={heading} tabIndex={-1} className="rounded text-xl font-semibold focus-visible:outline-2 focus-visible:outline-ring">Перегляд пакета · {preview.items.length} операцій</h2>
    <div className="flex flex-wrap gap-2 text-sm" aria-label="Підсумок операцій">
      {Object.entries(counts).map(([action, count]) => count > 0 && <span key={action} className={`rounded-md px-2 py-1 ${action === "delete" ? "bg-destructive/10 font-semibold text-destructive" : "bg-muted"}`}>{actionLabels[action as keyof typeof counts]}: {count}</span>)}
      {preview.unchanged.length > 0 && <span className="rounded-md bg-muted px-2 py-1">Без змін: {preview.unchanged.length}</span>}
    </div>
    <p className="text-sm text-muted-foreground">Ще нічого не збережено. Буде виконано весь пакет або жодної зміни. Операції показані в порядку виконання.</p>
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground" aria-label="Типи записів у пакеті">{Object.entries(inventoryEntityLabels).map(([entity, label]) => {
      const count = preview.items.filter((item) => mutationDefinitions[item.kind].entity === entity).length;
      return count > 0 ? <li key={entity}>{label}: {count}</li> : null;
    })}</ul>
    {deleting && <p className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm font-medium text-destructive">Пакет містить видалення. Відновлення через помічника немає. Перевірте записи з позначкою «Видалення».</p>}
    {assumptions.length > 0 && <details className="rounded-lg bg-muted p-3" open><summary className="cursor-pointer font-medium">Запропоновані значення</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{assumptions.map((item, index) => <li className="break-words" key={index}>{item}</li>)}</ul></details>}
    {preview.unchanged.length > 0 && <details className="rounded-lg border p-3 text-sm"><summary className="cursor-pointer">Без змін · {preview.unchanged.length}</summary><ul className="mt-2 list-disc pl-5">{preview.unchanged.map((title, index) => <li className="break-words" key={index}>{title}</li>)}</ul></details>}
    <ol className="space-y-3">{preview.items.map((item, index) => {
      const definition = mutationDefinitions[item.kind];
      const summary = previewSummary(item);
      const recipes = item.kind === "createIngredient" ? dependencies.get(item.after.title.toLocaleLowerCase("uk")) : null;
      return <li key={`${item.kind}:${index}`} className={`min-w-0 space-y-3 rounded-lg border p-3 sm:p-4 ${definition.action === "delete" ? "border-destructive bg-destructive/5" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">{index + 1} · {inventoryEntityLabels[definition.entity]}</span><span className={`font-semibold ${definition.action === "delete" ? "text-destructive" : ""}`}>{actionLabels[definition.action]}</span>{"target" in item && <span className="text-muted-foreground">#{item.target.id}</span>}</div>
        <h3 className="break-words font-semibold [overflow-wrap:anywhere]">{summary.title}</h3>
        {recipes && <p className="rounded-md bg-primary/10 p-2 text-sm">Новий інгредієнт для рецептів: {recipes.join(", ")}. Створюється в цьому пакеті; значення нижче також потребують перевірки.</p>}
        {definition.action === "delete" ? <p className="text-sm font-medium text-destructive">Запис буде видалено повністю.</p> : <dl className="space-y-2 text-sm">{summary.rows.map((row) => <div key={row.label} className="grid min-w-0 gap-1 border-t pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><dt className="font-medium">{row.label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{row.before !== null && <><span className="text-muted-foreground">{row.before}</span><span aria-label=" зміниться на "> → </span></>}<span className="font-medium">{row.after ?? "Вилучено зі складу"}</span></dd></div>)}</dl>}
        <details className="text-sm"><summary className="cursor-pointer py-1 font-medium underline underline-offset-4">Усі дані запису</summary><div className="mt-3"><Snapshot item={item} /></div></details>
      </li>;
    })}</ol>
    <div className="sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-lg">
      <p className="w-full text-sm font-medium">До виконання: {preview.items.length}{deleting ? ` · Видалень: ${counts.delete}` : ""}</p>
      <Button className="min-h-11" disabled={busy} type="button" variant="outline" onClick={onCancel}>Скасувати</Button>
      <Button className="min-h-11 flex-1 whitespace-normal sm:flex-none" disabled={busy} type="submit" variant={deleting ? "destructive" : "default"}>{busy ? "Збереження…" : `Підтвердити всі ${preview.items.length}`}</Button>
    </div>
  </form>;
}
