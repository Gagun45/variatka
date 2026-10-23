"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import InventoryBatchView from "./InventoryBatchView";
import { draftStatusMessages, type DraftStatus } from "@/lib/ai/request-state";

export default function InventoryMutationView({ preview, assumptions, busy, status = "ready", onChange, onConfirm, onPrepare, onCancel }: {
  preview: InventoryMutationPreview;
  assumptions: string[];
  busy: boolean;
  status?: DraftStatus;
  onChange: (preview: InventoryMutationPreview) => void;
  onConfirm: () => void;
  onPrepare?: () => void;
  onCancel: () => void;
}) {
  if ((preview.kind !== "createIngredient" && preview.kind !== "createStuff") || status === "stale" || status === "uncertain") return <InventoryBatchView preview={{ items: [preview], unchanged: [] }} assumptions={assumptions} busy={busy} status={status} onConfirm={onConfirm} onPrepare={onPrepare} onCancel={onCancel} />;
  function editCreationField(field: "title" | "description", value: string) {
    if (preview.kind === "createIngredient") onChange({ ...preview, after: { ...preview.after, [field]: value } });
    else if (preview.kind === "createStuff") onChange({ ...preview, after: { ...preview.after, [field]: value } });
  }
  const submitLabel = busy
    ? status === "ready" ? "Збереження…" : "Підготовка…"
    : status === "ready" ? "Підтвердити створення" : "Перевірити пропозицію";
  return <form onSubmit={(event) => { event.preventDefault(); if (busy) return; if (status === "ready") onConfirm(); else onPrepare?.(); }} className="space-y-4 rounded-xl border p-3 sm:p-5">
    <h2 className="text-xl font-semibold">{preview.kind === "createIngredient" ? "Створення інгредієнта" : "Створення матеріалу"}</h2>
    <p className="text-sm text-muted-foreground">{status === "invalid" ? draftStatusMessages.invalid : "Ще нічого не збережено. Перевірте запропоновані значення."}</p>
    {assumptions.length > 0 && <details open className="rounded-lg bg-muted p-3 text-sm"><summary className="cursor-pointer font-medium">Запропоновані значення</summary><ul className="mt-2 list-disc pl-5">{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
    <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="block space-y-1"><span>Назва</span><Input required maxLength={200} value={preview.after.title} onChange={(event) => editCreationField("title", event.target.value)} /></label>
        <label className="block space-y-1"><span>Опис</span><Textarea maxLength={10000} value={preview.after.description ?? ""} onChange={(event) => editCreationField("description", event.target.value)} /></label>
        {preview.kind === "createIngredient" ? <>
          <label className="block space-y-1"><span>Категорія</span><select className="block w-full rounded-md border bg-background p-2" value={preview.after.category} onChange={(event) => onChange({ ...preview, after: { ...preview.after, category: event.target.value as "SPICES" | "OTHER" } })}><option value="SPICES">Спеції</option><option value="OTHER">Інше</option></select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={preview.after.isInStock} onChange={(event) => onChange({ ...preview, after: { ...preview.after, isInStock: event.target.checked } })} />У наявності</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={preview.after.isSaved} onChange={(event) => onChange({ ...preview, after: { ...preview.after, isSaved: event.target.checked } })} />Збережений</label>
        </> : <>
          <label className="block space-y-1"><span>Категорія</span><select className="block w-full rounded-md border bg-background p-2" value={preview.after.category} onChange={(event) => onChange({ ...preview, after: { ...preview.after, category: event.target.value as "DECOR" | "JARS" } })}><option value="JARS">Слоїчки</option><option value="DECOR">Пакування та декор</option></select></label>
          <label className="block space-y-1"><span>Залишок</span><Input type="number" min={0} max={2147483647} step={1} required value={Number.isNaN(preview.after.inStock) ? "" : preview.after.inStock} onChange={(event) => onChange({ ...preview, after: { ...preview.after, inStock: event.target.valueAsNumber } })} /></label>
        </>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button className="min-h-11" type="button" variant="outline" onClick={onCancel}>Скасувати</Button>
        <Button className="min-h-11" type="submit" disabled={!preview.after.title.trim() || (status === "invalid" && !onPrepare)}>{submitLabel}</Button>
      </div>
    </fieldset>
  </form>;
}
