import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { mutationDefinitions } from "./mutation-definitions";
import { inventoryCategoryLabels, inventorySeriesLabels } from "./inventory-labels";

const labels: Record<string, string> = {
  title: "Назва", description: "Опис", category: "Категорія", isInStock: "У наявності", isSaved: "Збережений", inStock: "Залишок",
  notes: "Нотатки", confirmationNotes: "Примітки до підтвердження", series: "Серія", spicy: "Гострота", isHidden: "Прихований", isConfirmed: "Підтверджений",
};
export function previewValue(key: string, value: unknown): string {
  if (value === null || value === "") return "Не вказано";
  if (typeof value === "boolean") return value ? "Так" : "Ні";
  if (key === "category") return inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels] ?? String(value);
  if (key === "series") return inventorySeriesLabels[value as keyof typeof inventorySeriesLabels] ?? String(value);
  return String(value);
}
export type PreviewRow = { label: string; before: string | null; after: string | null };
export function previewSummary(preview: InventoryMutationPreview) {
  const before = "before" in preview ? preview.before : null;
  const after = "after" in preview ? preview.after : null;
  const oldFields = before && ("fields" in before ? before.fields : before);
  const newFields = after && ("fields" in after ? after.fields : after);
  const fields = newFields ?? oldFields!;
  const rows: PreviewRow[] = Object.entries(fields).flatMap(([key, data]) => {
    if (oldFields && newFields && oldFields[key as keyof typeof oldFields] === data) return [];
    return [{ label: labels[key] ?? key, before: oldFields ? previewValue(key, oldFields[key as keyof typeof oldFields]) : null, after: newFields ? previewValue(key, data) : null }];
  });
  const oldItems = before && "ingredients" in before ? before.ingredients : [];
  const newItems = after && "ingredients" in after ? after.ingredients : [];
  const identity = (item: (typeof newItems)[number]) => item.id === null ? `new:${item.title}` : `id:${item.id}`;
  const oldMap = new Map(oldItems.map((item) => [identity(item), item]));
  const newMap = new Map(newItems.map((item) => [identity(item), item]));
  for (const [id, item] of oldMap) {
    const next = newMap.get(id);
    if (!next || next.amount !== item.amount || next.title !== item.title) rows.push({ label: `Склад: ${next?.title ?? item.title}`, before: item.amount, after: next?.amount ?? null });
  }
  for (const [id, item] of newMap) if (!oldMap.has(id)) rows.push({ label: `Склад: ${item.title}${item.id === null ? " (новий інгредієнт)" : ""}`, before: null, after: item.amount });
  return { title: fields.title, rows };
}

export function snapshotRows(snapshot: Extract<InventoryMutationPreview, { after: unknown }>["after"]): PreviewRow[] {
  const fields = "fields" in snapshot ? snapshot.fields : snapshot;
  const rows = Object.entries(fields).map(([key, value]) => ({ label: labels[key] ?? key, before: null, after: previewValue(key, value) }));
  if ("ingredients" in snapshot) {
    if (!snapshot.ingredients.length) rows.push({ label: "Склад", before: null, after: "Інгредієнтів немає" });
    for (const item of snapshot.ingredients) rows.push({ label: `Склад: ${item.title}`, before: null, after: item.amount });
  }
  return rows;
}

export const previewActionLabels = { create: "Створення", update: "Оновлення", delete: "Видалення" };
export function previewPresentation(items: InventoryMutationPreview[]) {
  if (items.length !== 1) {
    const count = items.length;
    const word = count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? "операції" : "операцій";
    return { heading: `Перегляд пакета · ${count} ${word}`, confirmation: `Підтвердити всі ${count}` };
  }
  const item = items[0];
  const definition = mutationDefinitions[item.kind];
  const entity = { recipe: "рецепта", ingredient: "інгредієнта", stuff: "матеріалу" }[definition.entity];
  const action = definition.action;
  const confirmation = { create: "Підтвердити створення", update: "Підтвердити зміни", delete: "Підтвердити видалення" };
  return { heading: `${previewActionLabels[action]} ${entity}`, confirmation: confirmation[action] };
}
