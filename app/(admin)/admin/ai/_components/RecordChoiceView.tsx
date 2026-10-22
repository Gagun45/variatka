"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { RecordChoice } from "@/lib/domain/ai-resolution.service";
import type { RecordSelection } from "@/zod/ai-search.schema";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";

export default function RecordChoiceView({ question, prompt, busy, onChoose, onPage, onCancel }: {
  question: RecordChoice; prompt: string; busy: boolean;
  onChoose: (selection: RecordSelection) => void; onPage: (page: number) => void; onCancel: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [question.key, question.page]);
  return <section aria-label="Уточнення запису" className="space-y-4 rounded-xl border border-primary p-4">
    <h2 ref={heading} tabIndex={-1} className="rounded text-lg font-semibold focus-visible:outline-2 focus-visible:outline-ring">Який запис ви маєте на увазі: «{question.name}»?</h2>
    <p className="text-sm text-muted-foreground">{question.context}. Решту запиту збережено. Вибір лише готує перегляд — ще нічого не збережено.</p>
    <ul className="space-y-2">{question.candidates.map((item) => <li key={`${item.entity}:${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1 break-words"><p className="text-xs text-muted-foreground">{inventoryEntityLabels[item.entity]} · #{item.id}</p><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.summary}</p></div>
      <Button type="button" className="min-h-11" variant="outline" disabled={busy} onClick={() => onChoose({ entity: item.entity, id: item.id })} aria-label={`Обрати ${item.title}`}>Обрати</Button>
    </li>)}</ul>
    {!question.candidates.length && <p>На цій сторінці більше немає варіантів. Поверніться назад або змініть запит.</p>}
    <div className="flex flex-wrap items-center gap-2">
      {question.page > 0 && <Button type="button" variant="outline" disabled={busy} onClick={() => onPage(question.page - 1)}>Назад</Button>}
      {(question.hasMore || question.page > 0) && <span className="text-sm">Сторінка {question.page + 1}</span>}
      {question.hasMore && <Button type="button" variant="outline" disabled={busy} onClick={() => onPage(question.page + 1)}>Далі</Button>}
    </div>
    <details className="text-sm"><summary className="cursor-pointer">Початковий запит</summary><p className="mt-2 whitespace-pre-wrap break-words">{prompt}</p></details>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => onPage(0)}>Оновити варіанти</Button><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Скасувати весь запит</Button></div>
  </section>;
}
