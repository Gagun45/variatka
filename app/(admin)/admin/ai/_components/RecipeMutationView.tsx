"use client";

import { Button } from "@/components/ui/button";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import type { RecipeSnapshot } from "@/zod/ai-recipe.schema";
import { inventoryCategoryLabels, inventorySeriesLabels } from "@/lib/ai/inventory-labels";

type Preview = Extract<InventoryMutationPreview, { kind: "createRecipe" | "updateRecipe" | "deleteRecipe" }>;
const labels: Record<string, string> = { title: "Назва", description: "Опис", notes: "Нотатки", confirmationNotes: "Примітки до підтвердження", category: "Категорія", series: "Серія", spicy: "Гострота (0–4)", isHidden: "Прихований", isConfirmed: "Підтверджений", isSaved: "Збережений" };
function value(key: string, data: unknown) {
  if (data === "" || data === null) return "Не вказано";
  if (typeof data === "boolean") return data ? "Так" : "Ні";
  if (key === "category") return inventoryCategoryLabels[data as keyof typeof inventoryCategoryLabels];
  if (key === "series") return inventorySeriesLabels[data as keyof typeof inventorySeriesLabels];
  return String(data);
}
function Composition({ snapshot }: { snapshot: RecipeSnapshot | null }) {
  if (!snapshot?.ingredients.length) return <p className="text-sm text-muted-foreground">Інгредієнтів немає</p>;
  return <ul className="list-disc space-y-1 pl-5 text-sm">{snapshot.ingredients.map((item) => <li key={item.id ?? item.title} className="break-words">{item.title} — {item.amount}{item.id === null && <span className="font-medium"> · новий інгредієнт</span>}</li>)}</ul>;
}
export default function RecipeMutationView({ preview, busy, embedded, onConfirm, onCancel }: { preview: Preview; busy: boolean; embedded: boolean; onConfirm: () => void; onCancel: () => void }) {
  const before = "before" in preview ? preview.before : null;
  const after = "after" in preview ? preview.after : null;
  const entries = Object.entries(after?.fields ?? before!.fields).filter(([key, data]) => !before || !after || data !== before.fields[key as keyof typeof before.fields]);
  const Container = embedded ? "div" : "form";
  return <Container onSubmit={(event) => { event.preventDefault(); onConfirm(); }} className="space-y-4 rounded-xl border p-5">
    <h2 className="text-lg font-semibold">{preview.kind === "createRecipe" ? "Новий рецепт" : preview.kind === "deleteRecipe" ? "Видалення рецепта" : "Зміни рецепта"}: {after?.fields.title ?? before?.fields.title}</h2>
    {"target" in preview && <p className="text-sm text-muted-foreground">Запис #{preview.target.id} · {preview.target.title}</p>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Поле</th>{before && <th className="p-2">Було</th>}<th className="p-2">Буде</th></tr></thead><tbody>{entries.map(([key, data]) => <tr className="border-t align-top" key={key}><th className="p-2 font-medium">{labels[key]}</th>{before && <td className="max-w-64 whitespace-pre-wrap break-words p-2">{value(key, before.fields[key as keyof typeof before.fields])}</td>}<td className="max-w-64 whitespace-pre-wrap break-words p-2">{after ? value(key, data) : "—"}</td></tr>)}</tbody></table></div>
    <div className="grid gap-4 sm:grid-cols-2">{before && <div><h3 className="mb-2 font-medium">Склад: було</h3><Composition snapshot={before} /></div>}<div><h3 className="mb-2 font-medium">Склад: буде</h3><Composition snapshot={after} /></div></div>
    <p className="text-sm text-muted-foreground">Ще нічого не збережено. Для виправлення скасуйте перегляд і надішліть уточнений запит.</p>
    {!embedded && <div className="flex gap-2"><Button disabled={busy} type="submit">Підтвердити</Button><Button disabled={busy} type="button" variant="outline" onClick={onCancel}>Скасувати</Button></div>}
  </Container>;
}
