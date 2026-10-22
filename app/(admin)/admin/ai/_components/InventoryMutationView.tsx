"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inventoryCategoryLabels } from "@/lib/ai/inventory-labels";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";

const labels: Record<string, string> = { title: "Назва", description: "Опис", category: "Категорія", isInStock: "У наявності", isSaved: "Збережений", inStock: "Залишок" };
function display(key: string, value: unknown) {
  if (value === null || value === "") return "Не вказано";
  if (typeof value === "boolean") return value ? "Так" : "Ні";
  if (key === "category") return inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels];
  return String(value);
}

export default function InventoryMutationView({ preview, assumptions, busy, onChange, onConfirm, onCancel }: {
  preview: InventoryMutationPreview;
  assumptions: string[];
  busy: boolean;
  onChange: (preview: InventoryMutationPreview) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const deleting = preview.kind === "deleteIngredient" || preview.kind === "deleteStuff";
  const creating = preview.kind === "createStuff";
  const before = "before" in preview ? preview.before : null;
  const after = "after" in preview ? preview.after : null;
  const changes = before ? Object.entries(before).filter(([key, value]) => !after || value !== after[key as keyof typeof after]) : [];

  return <form onSubmit={(event) => { event.preventDefault(); onConfirm(); }} className={`space-y-4 rounded-xl border p-5 ${deleting ? "border-destructive" : ""}`}>
    <h2 className="text-lg font-semibold">{deleting ? "Перегляд видалення" : creating ? "Новий матеріал" : "Перегляд змін"}</h2>
    {"target" in preview && <p className="break-words font-medium">{preview.kind.endsWith("Ingredient") ? "Інгредієнт" : "Матеріал"}: {preview.target.title} · #{preview.target.id}</p>}
    <p className="text-sm text-muted-foreground">{deleting ? "Цей запис буде видалено без можливості відновлення через помічника. Перевірте назву та підтвердьте видалення." : "Ще нічого не збережено. Перевірте запропоновані значення."}</p>
    {assumptions.length > 0 && <div className="rounded-lg bg-muted p-3 text-sm"><p className="font-medium">Запропоновані значення:</p><ul className="list-disc pl-5">{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
    <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
      {preview.kind === "createStuff" ? <>
        <label className="block space-y-1"><span>Назва</span><Input required maxLength={200} value={preview.after.title} onChange={(event) => onChange({ ...preview, after: { ...preview.after, title: event.target.value } })} /></label>
        <label className="block space-y-1"><span>Опис</span><Textarea maxLength={10000} value={preview.after.description ?? ""} onChange={(event) => onChange({ ...preview, after: { ...preview.after, description: event.target.value } })} /></label>
        <label className="block space-y-1"><span>Категорія</span><select className="block w-full rounded-md border bg-background p-2" value={preview.after.category} onChange={(event) => onChange({ ...preview, after: { ...preview.after, category: event.target.value as "DECOR" | "JARS" } })}><option value="JARS">Слоїчки</option><option value="DECOR">Пакування та декор</option></select></label>
        <label className="block space-y-1"><span>Залишок</span><Input type="number" min={0} max={2147483647} step={1} required value={preview.after.inStock} onChange={(event) => onChange({ ...preview, after: { ...preview.after, inStock: event.target.valueAsNumber } })} /></label>
      </> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th className="p-2">Поле</th><th className="p-2">Було</th><th className="p-2">{deleting ? "Після видалення" : "Буде"}</th></tr></thead>
          <tbody>{changes.map(([key, value]) => <tr key={key} className="border-b align-top"><th className="p-2 font-medium">{labels[key]}</th><td className="max-w-64 whitespace-pre-wrap break-words p-2">{display(key, value)}</td><td className="max-w-64 whitespace-pre-wrap break-words p-2">{after ? display(key, after[key as keyof typeof after]) : "—"}</td></tr>)}</tbody>
        </table></div>
        {!deleting && <p className="text-sm text-muted-foreground">Решта полів залишаться без змін. Щоб виправити пропозицію, скасуйте її та надішліть уточнений запит.</p>}
      </>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={deleting ? "destructive" : "default"} disabled={creating && !preview.after.title.trim()}>{deleting ? "Підтвердити видалення" : creating ? "Підтвердити створення" : "Підтвердити зміни"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Скасувати</Button>
      </div>
    </fieldset>
  </form>;
}
