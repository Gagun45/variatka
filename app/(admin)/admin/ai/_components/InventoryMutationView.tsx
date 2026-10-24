"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import InventoryBatchView from "./InventoryBatchView";
import { draftStatusMessages, type DraftStatus } from "@/lib/ai/request-state";

export default function InventoryMutationView({ preview, assumptions, busy, status = "ready", autoFocus = true, onChange, onConfirm, onPrepare, onCancel }: {
  preview: InventoryMutationPreview;
  assumptions: string[];
  busy: boolean;
  status?: DraftStatus;
  autoFocus?: boolean;
  onChange: (preview: InventoryMutationPreview) => void;
  onConfirm: () => void;
  onPrepare?: () => void;
  onCancel: () => void;
}) {
  if ((preview.kind !== "createIngredient" && preview.kind !== "createStuff") || status === "stale" || status === "uncertain") return <InventoryBatchView preview={{ items: [preview], unchanged: [] }} assumptions={assumptions} busy={busy} status={status} autoFocus={autoFocus} onConfirm={onConfirm} onPrepare={onPrepare} onCancel={onCancel} />;
  function editCreationField(field: "title" | "description", value: string) {
    if (preview.kind === "createIngredient") onChange({ ...preview, after: { ...preview.after, [field]: value } });
    else if (preview.kind === "createStuff") onChange({ ...preview, after: { ...preview.after, [field]: value } });
  }
  const submitLabel = busy
    ? "Зачекайте…"
    : status === "ready" ? "Підтвердити створення" : "Перевірити пропозицію";
  return <form onSubmit={(event) => { event.preventDefault(); if (busy) return; if (status === "ready") onConfirm(); else onPrepare?.(); }} className="space-y-5 rounded-2xl border bg-card p-4 shadow-surface sm:p-6">
    <div className="space-y-1"><h2 className="text-lg font-semibold">{preview.kind === "createIngredient" ? "Створення інгредієнта" : "Створення матеріалу"}</h2>
    <p className="text-sm text-muted-foreground">{status === "invalid" ? draftStatusMessages.invalid : "Перевірте поля перед збереженням."}</p></div>
    {assumptions.length > 0 && <details className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm"><summary className="cursor-pointer text-muted-foreground">Як заповнено поля</summary><p className="mt-2 text-xs text-muted-foreground">Це початкові припущення. Актуальні значення показано в полях нижче.</p><ul className="mt-2 list-disc pl-5">{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
    <fieldset disabled={busy} className="grid gap-4 text-sm disabled:opacity-60 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2"><span className="font-medium">Назва</span><Input required maxLength={200} value={preview.after.title} onChange={(event) => editCreationField("title", event.target.value)} /></label>
        <label className="block space-y-1.5 sm:col-span-2"><span className="font-medium">Опис</span><Textarea maxLength={10000} value={preview.after.description ?? ""} onChange={(event) => editCreationField("description", event.target.value)} /></label>
        {preview.kind === "createIngredient" ? <>
          <label className="block space-y-1.5"><span className="font-medium">Категорія</span><select className="block min-h-10 w-full rounded-lg border bg-background px-3" value={preview.after.category} onChange={(event) => onChange({ ...preview, after: { ...preview.after, category: event.target.value as "SPICES" | "OTHER" } })}><option value="SPICES">Спеції</option><option value="OTHER">Інше</option></select></label>
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3 pb-2"><label className="flex items-center gap-2"><input className="size-4 accent-primary" type="checkbox" checked={preview.after.isInStock} onChange={(event) => onChange({ ...preview, after: { ...preview.after, isInStock: event.target.checked } })} />У наявності</label>
          <label className="flex items-center gap-2"><input className="size-4 accent-primary" type="checkbox" checked={preview.after.isSaved} onChange={(event) => onChange({ ...preview, after: { ...preview.after, isSaved: event.target.checked } })} />Збережений</label></div>
        </> : <>
          <label className="block space-y-1.5"><span className="font-medium">Категорія</span><select className="block min-h-10 w-full rounded-lg border bg-background px-3" value={preview.after.category} onChange={(event) => onChange({ ...preview, after: { ...preview.after, category: event.target.value as "DECOR" | "JARS" } })}><option value="JARS">Слоїчки</option><option value="DECOR">Пакування та декор</option></select></label>
          <label className="block space-y-1.5"><span className="font-medium">Залишок</span><Input type="number" min={0} max={2147483647} step={1} required value={Number.isNaN(preview.after.inStock) ? "" : preview.after.inStock} onChange={(event) => onChange({ ...preview, after: { ...preview.after, inStock: event.target.valueAsNumber } })} /></label>
        </>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 sm:col-span-2">
        <Button className="min-h-11" type="button" variant="outline" onClick={onCancel}>Скасувати</Button>
        <Button className="min-h-11" type="submit" disabled={!preview.after.title.trim() || (status === "invalid" && !onPrepare)}>{submitLabel}</Button>
      </div>
    </fieldset>
  </form>;
}
