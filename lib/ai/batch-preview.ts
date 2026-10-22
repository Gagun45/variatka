import { MAX_BATCH_OPERATIONS, type BatchPreview } from "@/zod/ai-batch.schema";
import type { InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { mutationDefinitions } from "./mutation-definitions";
import { AppError, NoChangesError } from "../error";

const key = (title: string) => title.toLocaleLowerCase("uk");
export function completeBatchPreview(items: InventoryMutationPreview[], unchanged: string[] = []): BatchPreview {
  const result = [...items];
  const creations = new Map<string, InventoryMutationPreview>();
  const targets = new Set<string>();
  for (const item of result) {
    const definition = mutationDefinitions[item.kind];
    const identity = "target" in item ? `${definition.entity}:id:${item.target.id}` : `${definition.entity}:title:${key(item.kind === "createRecipe" ? item.after.fields.title : item.after.title)}`;
    if (targets.has(identity)) throw new AppError("Пакет містить повторні або суперечливі операції над одним записом. Об’єднайте їх в одну зміну.");
    targets.add(identity);
    if (item.kind === "createIngredient") creations.set(key(item.after.title), item);
  }
  for (const item of items) {
    if (item.kind !== "createRecipe" && item.kind !== "updateRecipe") continue;
    for (const ingredient of item.after.ingredients) {
      if (ingredient.id !== null || creations.has(key(ingredient.title))) continue;
      const creation: InventoryMutationPreview = { kind: "createIngredient", after: { title: ingredient.title, category: ingredient.category, description: "", isInStock: false, isSaved: false } };
      creations.set(key(ingredient.title), creation);
      result.push(creation);
    }
  }
  if (result.length > MAX_BATCH_OPERATIONS) throw new AppError(`Пакет перевищує ${MAX_BATCH_OPERATIONS} операцій, включно зі створенням відсутніх інгредієнтів. Звузьте запит.`);
  if (!result.length) throw new NoChangesError(`Змін не потрібно: усі записи вже мають потрібні значення.${unchanged.length ? ` Без змін: ${unchanged.join(", ")}.` : ""}`);
  // Dependencies first; recipe removals/edits before deleting ingredients they referenced.
  const rank: Record<InventoryMutationPreview["kind"], number> = { createIngredient: 0, createStuff: 1, createRecipe: 2, updateIngredient: 3, updateStuff: 3, updateRecipe: 3, deleteRecipe: 4, deleteStuff: 4, deleteIngredient: 5 };
  return { items: result.sort((a, b) => rank[a.kind] - rank[b.kind]), unchanged };
}

