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

export default function InventoryPreviewCard({ item, number, recipes, framed = true }: { item: InventoryMutationPreview; number?: number; recipes?: string[]; framed?: boolean }) {
  const definition = mutationDefinitions[item.kind];
  const summary = previewSummary(item);
  return <article className={`min-w-0 space-y-3 rounded-xl ${framed ? "border p-3 sm:p-4" : ""} ${definition.action === "delete" ? "border-destructive/30 bg-destructive/5 p-3 sm:p-4" : ""}`}>
    {framed && <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-muted-foreground">{number !== undefined && `${number} · `}{inventoryEntityLabels[definition.entity]}</span><span className={`rounded-md px-2 py-0.5 font-medium ${definition.action === "delete" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{previewActionLabels[definition.action]}</span></div>}
    <h3 className="break-words font-semibold [overflow-wrap:anywhere]">{summary.title}</h3>
    {recipes && <p className="break-words rounded-md bg-primary/5 px-3 py-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">Для рецептів: {recipes.join(", ")}</p>}
    {definition.action === "delete" ? <p className="text-sm font-medium text-destructive">Запис буде видалено повністю.</p> : <dl className="space-y-2 text-sm">{summary.rows.map((row) => <div key={row.label} className="grid min-w-0 gap-1 border-t pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><dt className="font-medium">{row.label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{row.before !== null && <><span className="text-muted-foreground">{row.before}</span><span aria-label=" зміниться на "> → </span></>}<span className="font-medium">{row.after ?? "Вилучено зі складу"}</span></dd></div>)}</dl>}
    <details className="text-sm"><summary className="cursor-pointer py-1 font-medium underline underline-offset-4">Усі дані запису</summary><div className="mt-3"><Snapshot item={item} /></div></details>
  </article>;
}
