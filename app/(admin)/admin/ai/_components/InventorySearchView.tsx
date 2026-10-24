"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";
import type { InventoryRecord, InventoryResult, InventorySearchResult } from "@/lib/ai/inventory.types";
import { frontendUrls } from "@/lib/urls";
import { searchFilters } from "@/lib/ai/search-labels";

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
    <section aria-label="Результати пошуку" className="space-y-4 rounded-2xl border bg-card p-4 shadow-surface sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">{results.search.entity === "all" ? "Результати пошуку" : inventoryEntityLabels[results.search.entity]}</h2><span className="text-xs text-muted-foreground">Показано {results.items.length}</span></div>
      {filters.length > 0 && <ul aria-label="Фільтри пошуку" className="flex flex-wrap gap-1.5">{filters.map((filter) => <li key={filter} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{filter}</li>)}</ul>}
      {!results.items.length && <p role="status">Нічого не знайдено. Спробуйте коротшу назву або інші фільтри.</p>}
      <ul className="divide-y">
        {results.items.map((record) => {
          const active = selected?.entity === record.entity && selected.id === record.id;
          return <li key={`${record.entity}:${record.id}`} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 ${active ? "bg-primary/5" : ""}`}>
            <div className="min-w-0 flex-1 break-words">
              {results.search.entity === "all" && <p className="text-xs text-muted-foreground">{inventoryEntityLabels[record.entity]}</p>}
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-muted-foreground">{record.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" className="min-h-10" variant={active ? "secondary" : "outline"} disabled={busy} aria-pressed={active} onClick={() => onSelect(record)}>{active ? "Обрано" : "Обрати"}</Button>
              <Link className="text-sm underline" href={recordHref(record)} target="_blank" rel="noopener noreferrer">Відкрити<span className="sr-only"> {record.title} у новій вкладці</span></Link>
            </div>
          </li>;
        })}
      </ul>
      {results.hasMore && <Button type="button" variant="outline" disabled={busy} onClick={onMore}>Показати ще</Button>}
    </section>
  );
}

export function InventoryRecordView({ record, busy, expanded = false, onExpandedChange, onClear }: { record: InventoryRecord; busy: boolean; expanded?: boolean; onExpandedChange?: (open: boolean) => void; onClear: () => void }) {
  return (
    <section aria-label="Обраний запис" className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs text-muted-foreground">Обрано · {inventoryEntityLabels[record.entity]}</p><h2 className="break-words font-semibold">{record.title}</h2></div>
        <Button type="button" variant="ghost" className="min-h-10 shrink-0 text-xs text-muted-foreground" disabled={busy} onClick={onClear}>Скасувати вибір</Button>
      </div>
      <details open={expanded} onToggle={(event) => onExpandedChange?.(event.currentTarget.open)} className="text-sm">
      <summary className="cursor-pointer text-muted-foreground">Дані запису{record.entity === "recipe" ? " та склад" : ""}</summary>
      <div className="mt-4 space-y-4 border-t pt-4">
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
      </div>
      </details>
    </section>
  );
}
