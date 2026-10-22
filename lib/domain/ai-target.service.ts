import type { InventoryMutationIntent } from "@/zod/ai-mutation.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import { mutationDefinitions } from "../ai/mutation-definitions";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { searchInventory } from "./ai-inventory.service";

export async function resolveMutationTarget(intent: Exclude<InventoryMutationIntent, { kind: "createIngredient" | "createStuff" | "createRecipe" }>, selected: RecordSelection | null, explicitlyChosen: boolean) {
  const entity = mutationDefinitions[intent.kind].entity;
  let selection = selected;
  if (intent.targetName !== null && !explicitlyChosen) {
    const args = { where: { title: { equals: intent.targetName, mode: "insensitive" as const } }, take: 2, select: { id: true } };
    const exact = entity === "ingredient" ? await prisma.ingredient.findMany(args) : entity === "stuff" ? await prisma.stuff.findMany(args) : await prisma.recipe.findMany(args);
    if (exact.length === 1) selection = { entity, id: exact[0].id };
    else {
      const common = { text: intent.targetName, category: null };
      const results = await searchInventory(entity === "ingredient"
        ? { entity, ...common, isInStock: null, isSaved: null }
        : entity === "stuff" ? { entity, ...common, isInStock: null, stockMin: null, stockMax: null }
        : { entity, ...common, series: null, isHidden: null, isConfirmed: null, isSaved: null, isInStock: null, readyToCook: null, spicyMin: null, spicyMax: null, includeIngredients: [], excludeIngredients: [] });
      if (!results.items.length) throw new AppError("Запис не знайдено. Уточніть назву або спочатку знайдіть та оберіть запис.");
      return { kind: "choose" as const, intent, results };
    }
  }
  if (!selection || selection.entity !== entity) throw new AppError("Спочатку оберіть запис потрібного типу або вкажіть його точну назву.");
  return { kind: "selected" as const, selection };
}
