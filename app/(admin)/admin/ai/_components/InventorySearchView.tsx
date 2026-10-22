"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { inventoryCategoryLabels, inventoryEntityLabels, inventorySeriesLabels } from "@/lib/ai/inventory-labels";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "@/lib/ai/inventory.types";
import { frontendUrls } from "@/lib/urls";
import type { InventorySearch } from "@/zod/ai-search.schema";

const filterLabels: Record<string, string> = {
  text: "Назва або опис", category: "Категорія", series: "Серія", isInStock: "У наявності",
  isSaved: "Збережений", isHidden: "Прихований", isConfirmed: "Підтверджений",
  readyToCook: "Усі інгредієнти в наявності", spicyMin: "Гострота від", spicyMax: "Гострота до",
  stockMin: "Залишок від", stockMax: "Залишок до", includeIngredients: "Містить усі", excludeIngredients: "Не містить",
};

function searchFilters(search: InventorySearch) {
  return Object.entries(search).flatMap(([key, value]) => {
    if (key === "entity" || value === null || (Array.isArray(value) && !value.length)) return [];
    let label: string;
    if (typeof value === "boolean") label = value ? "Так" : "Ні";
    else if (Array.isArray(value)) label = value.join(", ");
    else if (key === "category") label = inventoryCategoryLabels[value as keyof typeof inventoryCategoryLabels];
    else if (key === "series") label = inventorySeriesLabels[value as keyof typeof inventorySeriesLabels];
    else label = String(value);
    return [`${filterLabels[key]}: ${label}`];
  });
}

const recordHref = (record: InventoryResult) => {
  if (record.entity === "ingredient") return frontendUrls.ingredients.view(record.id);
  if (record.entity === "recipe") return frontendUrls.recipes.view(record.id);
  return frontendUrls.stuff.view(record.id);
};

export function InventorySearchView({ results, selected, busy, onSelect, onMore }: {
  results: InventorySearchResult;
  selected: InventoryRecord | null;
  busy: boolean;
  onSelect: (record: InventoryResult) => void;
  onMore: () => void;
}) {
  const filters = searchFilters(results.search);
  return (
    <section aria-label="Результати пошуку" className="space-y-3 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">{results.search.entity === "all" ? "Усі типи записів" : inventoryEntityLabels[results.search.entity]} — результати</h2>
      <p className="text-sm text-muted-foreground">{filters.length ? filters.join(" · ") : "Без додаткових фільтрів"}</p>
      <p className="text-xs text-muted-foreground">До 20 записів кожного типу за сторінку. Пошук за словами в назві та описі.</p>
      {!results.items.length && <p role="status">Нічого не знайдено. Спробуйте коротшу назву або інші фільтри.</p>}
      <ul className="space-y-2">
        {results.items.map((record) => {
          const active = selected?.entity === record.entity && selected.id === record.id;
          return <li key={`${record.entity}:${record.id}`} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${active ? "border-primary" : ""}`}>
            <div className="min-w-0 flex-1 break-words">
              <p className="text-xs text-muted-foreground">{inventoryEntityLabels[record.entity]} · #{record.id}</p>
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-muted-foreground">{record.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant={active ? "secondary" : "outline"} disabled={busy} aria-pressed={active} onClick={() => onSelect(record)}>{active ? "Обрано" : "Обрати"}</Button>
              <Link className="text-sm underline" href={recordHref(record)} target="_blank" rel="noopener noreferrer">Відкрити<span className="sr-only"> {record.title} у новій вкладці</span></Link>
            </div>
          </li>;
        })}
      </ul>
      {results.hasMore && <Button type="button" variant="outline" disabled={busy} onClick={onMore}>Показати ще</Button>}
    </section>
  );
}

export function InventoryRecordView({ record, busy, onClear }: { record: InventoryRecord; busy: boolean; onClear: () => void }) {
  return (
    <section aria-label="Обраний запис" className="space-y-4 rounded-xl border border-primary p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Обрано · {inventoryEntityLabels[record.entity]} · #{record.id}</p><h2 className="text-lg font-semibold break-words">{record.title}</h2></div>
        <Button type="button" variant="outline" disabled={busy} onClick={onClear}>Скасувати вибір</Button>
      </div>
      <p className="text-sm text-muted-foreground">Можна запитати «покажи опис»{record.entity === "recipe" ? " або «покажи її склад»" : ""}. Вибір діє до нового пошуку, скасування або перезавантаження сторінки.</p>
      <dl className="space-y-2">
        {record.fields.map((field) => <div key={field.label} className="grid gap-1 sm:grid-cols-[1fr_2fr]">
          <dt className="text-sm text-muted-foreground">{field.label}</dt><dd className="whitespace-pre-wrap break-words text-sm">{field.value}</dd>
        </div>)}
      </dl>
      {record.entity === "recipe" && <div>
        <h3 className="font-medium">Склад</h3>
        {record.ingredients.length ? <ul className="mt-2 space-y-1">{record.ingredients.map((item) => <li key={item.id} className="break-words text-sm">{item.title} — {item.amount} · {item.isInStock ? "У наявності" : "Немає в наявності"}</li>)}</ul> : <p className="text-sm text-muted-foreground">Інгредієнти не додані.</p>}
      </div>}
      <Link className="inline-block text-sm underline" href={recordHref(record)} target="_blank" rel="noopener noreferrer">Відкрити сторінку запису в новій вкладці</Link>
    </section>
  );
}
