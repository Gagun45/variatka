"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { RecordChoice } from "@/lib/domain/ai-resolution.service";
import type { RecordSelection } from "@/zod/ai-search.schema";
import { inventoryEntityLabels } from "@/lib/ai/inventory-labels";

export default function RecordChoiceView({ question, prompt, busy, onChoose, onCreateNew, onPage, onCancel }: {
  question: RecordChoice; prompt: string; busy: boolean;
  onChoose: (selection: RecordSelection) => void; onCreateNew: () => void; onPage: (page: number) => void; onCancel: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [question.key, question.page]);
  const hasSameTitle = (item: RecordChoice["candidates"][number]) => question.candidates.some((other) => other.id !== item.id && other.entity === item.entity && other.title.toLocaleLowerCase("uk") === item.title.toLocaleLowerCase("uk"));
  return <section aria-label="Уточнення запису" className="space-y-4 rounded-2xl border border-primary/20 bg-card p-4 shadow-surface sm:p-5">
    <h2 ref={heading} tabIndex={-1} className="break-words rounded text-lg font-semibold [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-ring">{question.purpose === "ingredientCreation" ? `Перевірте схожі інгредієнти перед створенням «${question.name}»` : `Який запис ви маєте на увазі: «${question.name}»?`}</h2>
    <ul className="space-y-2">{question.candidates.map((item) => <li key={`${item.entity}:${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1 break-words"><p className="text-xs text-muted-foreground">{inventoryEntityLabels[item.entity]}{hasSameTitle(item) ? ` · #${item.id}` : ""}</p><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.summary}</p></div>
      <Button type="button" className="min-h-11" variant="outline" disabled={busy} onClick={() => onChoose({ entity: item.entity, id: item.id })} aria-label={`${question.purpose === "ingredientCreation" ? "Використати наявний" : "Обрати"} ${item.title}`}>{question.purpose === "ingredientCreation" ? "Використати наявний" : "Обрати"}</Button>
    </li>)}</ul>
    {!question.candidates.length && <p>На цій сторінці більше немає варіантів. Поверніться назад або змініть запит.</p>}
    <div className="flex flex-wrap items-center gap-2">
      {question.page > 0 && <Button type="button" variant="outline" disabled={busy} onClick={() => onPage(question.page - 1)}>Назад</Button>}
      {(question.hasMore || question.page > 0) && <span className="text-sm">Сторінка {question.page + 1}</span>}
      {question.hasMore && <Button type="button" variant="outline" disabled={busy} onClick={() => onPage(question.page + 1)}>Далі</Button>}
    </div>
    {question.purpose === "ingredientCreation" && <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
      <p>Наявний інгредієнт залишиться без змін. Для іншого інгредієнта створіть окремий запис.</p>
      {question.canCreate ? <Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={onCreateNew}>Це інший інгредієнт — створити окремий</Button> : <p>Ця назва вже зайнята. Для окремого інгредієнта скасуйте запит і вкажіть іншу назву.</p>}
    </div>}
    <details className="text-sm text-muted-foreground"><summary className="cursor-pointer">Початковий запит</summary><p className="mt-2">{question.context}</p><p className="mt-2 whitespace-pre-wrap break-words">{prompt}</p></details>
    <div className="flex flex-wrap justify-between gap-2 border-t pt-3"><Button type="button" variant="ghost" disabled={busy} onClick={() => onPage(0)}>Оновити варіанти</Button><Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>Скасувати весь запит</Button></div>
  </section>;
}
