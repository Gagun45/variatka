"use client";

import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import { previewSummary, snapshotRows, previewActionLabels } from "@/lib/ai/preview-summary";

function Snapshot({ item }: { item: InventoryMutationPreview }) {
  // Reuse the same read-only rows for full snapshots, including unchanged fields.
  const before = "before" in item ? item.before : null;
  const after = "after" in item ? item.after : null;
  return <div className="grid min-w-0 gap-4 sm:grid-cols-2">{[before, after].map((snapshot, index) => snapshot && <div key={index} className="min-w-0">
    <h4 className="mb-2 font-medium">{index === 0 ? "Було" : "Буде"}</h4>
    <dl className="space-y-2 text-sm">{snapshotRows(snapshot).map((row) => <div key={row.label} className="min-w-0"><dt className="text-muted-foreground">{row.label}</dt><dd className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{row.after ?? row.before}</dd></div>)}</dl>
  </div>)}</div>;
}

export default function InventoryPreviewCard({ item, number, recipes }: { item: InventoryMutationPreview; number?: number; recipes?: string[] }) {
  const definition = mutationDefinitions[item.kind];
  const summary = previewSummary(item);
  return <article className={`min-w-0 space-y-3 rounded-lg border p-3 sm:p-4 ${definition.action === "delete" ? "border-destructive bg-destructive/5" : ""}`}>
    <div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">{number !== undefined && `${number} · `}{inventoryEntityLabels[definition.entity]}</span><span className={`font-semibold ${definition.action === "delete" ? "text-destructive" : ""}`}>{previewActionLabels[definition.action]}</span>{"target" in item && <span className="text-muted-foreground">#{item.target.id}</span>}</div>
    <h3 className="break-words font-semibold [overflow-wrap:anywhere]">{summary.title}</h3>
    {recipes && <p className="rounded-md bg-primary/10 p-2 text-sm">Новий інгредієнт для рецептів: {recipes.join(", ")}. Створюється в цьому пакеті; значення нижче також потребують перевірки.</p>}
    {definition.action === "delete" ? <p className="text-sm font-medium text-destructive">Запис буде видалено повністю.</p> : <dl className="space-y-2 text-sm">{summary.rows.map((row) => <div key={row.label} className="grid min-w-0 gap-1 border-t pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><dt className="font-medium">{row.label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{row.before !== null && <><span className="text-muted-foreground">{row.before}</span><span aria-label=" зміниться на "> → </span></>}<span className="font-medium">{row.after ?? "Вилучено зі складу"}</span></dd></div>)}</dl>}
    <details className="text-sm"><summary className="cursor-pointer py-1 font-medium underline underline-offset-4">Усі дані запису</summary><div className="mt-3"><Snapshot item={item} /></div></details>
  </article>;
}
