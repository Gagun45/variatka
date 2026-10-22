"use client";

import { Button } from "@/components/ui/button";
import type { BatchPreview } from "@/zod/ai-batch.schema";
import { mutationDefinitions } from "@/lib/ai/mutation-definitions";
import InventoryMutationView from "./InventoryMutationView";

export default function InventoryBatchView({ preview, assumptions, busy, onConfirm, onCancel }: { preview: BatchPreview; assumptions: string[]; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const deleting = preview.items.some((item) => mutationDefinitions[item.kind].action === "delete");
  return <form onSubmit={(event) => { event.preventDefault(); onConfirm(); }} className="space-y-4 rounded-xl border border-primary p-4">
    <h2 className="text-xl font-semibold">Пакет: {preview.items.length} операцій</h2>
    <p>Буде збережено весь пакет або жодної зміни. Перевірте кожний запис нижче.</p>
    {deleting && <p className="font-medium text-destructive">Пакет містить видалення. Відновлення через помічника немає.</p>}
    {assumptions.length > 0 && <ul className="list-disc pl-5 text-sm">{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul>}
    {preview.unchanged.length > 0 && <p className="text-sm text-muted-foreground">Уже мають потрібні значення (без запису): {preview.unchanged.join(", ")}</p>}
    {preview.items.map((item, index) => <div key={`${item.kind}:${index}`}><p className="mb-1 text-sm font-medium">Операція {index + 1}</p><InventoryMutationView preview={item} assumptions={[]} busy={busy} embedded onChange={() => {}} onConfirm={() => {}} onCancel={() => {}} /></div>)}
    {preview.items.some((item) => (item.kind === "createRecipe" || item.kind === "updateRecipe") && item.after.ingredients.some((ingredient) => ingredient.id === null)) && <p className="text-sm text-muted-foreground">Нові інгредієнти для рецептів показані окремими операціями: опис порожній, наявність і збереження вимкнені. Щоб змінити пропозицію, скасуйте пакет і надішліть повний уточнений запит.</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={busy} type="submit">Підтвердити всі {preview.items.length} операцій</Button><Button disabled={busy} type="button" variant="outline" onClick={onCancel}>Скасувати пакет</Button></div>
  </form>;
}
