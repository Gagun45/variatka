import { WriteResolution, type OperationResolution } from "./ai-resolution.service";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { recipeWriteSchema, type RecipeSnapshot } from "@/zod/ai-recipe.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import { AppError, NoChangesError } from "../error";
import { prisma } from "../prisma";
import { resolveMutationTarget } from "./ai-target.service";

type RecipeIntent = Extract<InventoryMutationIntent, { kind: "createRecipe" | "updateRecipe" | "deleteRecipe" }>;
type Reference = RecipeSnapshot["ingredients"][number];
export type IngredientResolutionCache = Map<string, Reference>;

async function resolveIngredient(item: { title: string; amount: string; category: "SPICES" | "OTHER" | null }, cache: IngredientResolutionCache, resolution: OperationResolution, slot = ""): Promise<Reference> {
  // Exact spellings may identify different legacy records whose titles differ only by case.
  const key = item.title;
  const cached = cache.get(key);
  if (cached) return { ...cached, amount: item.amount };
  const record = await resolution.state.inventory("ingredient", item.title, `${resolution.index}:ingredient:${slot}`, `Операція ${resolution.index + 1}: інгредієнт рецепта`, true);
  const reference: Reference = record ? { id: record.id, title: record.title, category: record.category as Reference["category"], updatedAt: record.updatedAt.toISOString(), amount: item.amount } : { ...item, category: item.category ?? "OTHER", id: null, updatedAt: null };
  cache.set(key, reference);
  return reference;
}

function checkComposition(items: Reference[]) {
  const keys = items.map((item) => item.id === null ? `new:${item.title.toLocaleLowerCase("uk")}` : `id:${item.id}`);
  if (new Set(keys).size !== keys.length) throw new AppError("Склад містить повторюваний інгредієнт.");
  if (items.length > 50) throw new AppError("Один рецепт може містити до 50 інгредієнтів у цьому перегляді.");
}

export async function prepareRecipeMutation(intent: RecipeIntent, selected: RecordSelection | null, explicitlyChosen: boolean, cache: IngredientResolutionCache = new Map(), resolution: OperationResolution = { state: new WriteResolution({ decisions: [] }), index: 0 }) {
  if (intent.kind === "createRecipe") {
    const ingredients: Reference[] = [];
    for (const [index, item] of intent.ingredients.entries()) ingredients.push(await resolveIngredient(item, cache, resolution, String(index)));
    checkComposition(ingredients);
    const preview: InventoryMutationPreview = { kind: "createRecipe", after: { fields: intent.data, ingredients } };
    return { kind: "ready" as const, preview };
  }
  const target = await resolveMutationTarget(intent, selected, explicitlyChosen, resolution);
  const record = await prisma.recipe.findUnique({ where: { id: target.selection.id }, select: {
    id: true, updatedAt: true, title: true, description: true, notes: true, confirmationNotes: true, category: true, series: true, spicy: true, isHidden: true, isConfirmed: true, isSaved: true,
    _count: { select: { orderItems: true } },
    ingredients: { orderBy: { ingredientId: "asc" }, select: { amount: true, ingredient: { select: { id: true, title: true, category: true, updatedAt: true } } } },
  } });
  if (!record) throw new AppError("Рецепт більше не існує. Повторіть пошук.", "STALE_PREVIEW");
  const { id, updatedAt, ingredients, _count, ...fields } = record;
  const before: RecipeSnapshot = { fields: recipeWriteSchema.parse(fields), ingredients: ingredients.map(({ amount, ingredient }) => ({ ...ingredient, updatedAt: ingredient.updatedAt.toISOString(), amount })) };
  const identity = { id, title: record.title, updatedAt: updatedAt.toISOString() };
  if (intent.kind === "deleteRecipe") {
    if (_count.orderItems > 0) throw new AppError("Неможливо видалити рецепт, використаний у замовленнях.", "CONFLICT");
    const preview: InventoryMutationPreview = { kind: intent.kind, target: identity, before };
    return { kind: "ready" as const, preview };
  }
  const after: RecipeSnapshot = { fields: recipeWriteSchema.parse({ ...before.fields, ...Object.fromEntries(Object.entries(intent.patch).filter(([, value]) => value !== null)) }), ingredients: [...before.ingredients] };
  if (intent.composition) {
    if (intent.composition.mode === "replace") after.ingredients = [];
    const seen = new Set<string>();
    const seenIds = new Set<number>();
    for (const [changeIndex, change] of intent.composition.items.entries()) {
      const key = change.title.toLocaleLowerCase("uk");
      if (seen.has(key)) throw new AppError(`Повторна зміна інгредієнта «${change.title}» в одному запиті.`);
      seen.add(key);
      const matched: Reference | null = (change.action === "remove" || change.action === "setAmount") && intent.composition.mode === "patch"
        ? resolution.state.composition(change.title, before.ingredients, `${resolution.index}:composition:${changeIndex}`, `Операція ${resolution.index + 1}: склад рецепта «${record.title}»`)
        : null;
      if (matched?.id !== undefined && matched.id !== null) {
        if (seenIds.has(matched.id)) throw new AppError(`Повторна зміна інгредієнта «${matched.title}» в одному запиті.`);
        seenIds.add(matched.id);
      }
      const index = change.action === "add"
        ? after.ingredients.findIndex((item) => item.title.toLocaleLowerCase("uk") === key)
        : after.ingredients.findIndex((item) => item.id === matched?.id);
      if (change.action === "remove") {
        if (intent.composition.mode === "replace" || index < 0) throw new AppError(`Інгредієнт «${change.title}» не знайдено в складі.`);
        after.ingredients.splice(index, 1);
      } else {
        if (!change.amount) throw new AppError(`Вкажіть кількість для «${change.title}».`);
        if (change.action === "setAmount") {
          if (intent.composition.mode === "replace" || index < 0) throw new AppError(`Інгредієнт «${change.title}» не знайдено в складі.`);
          after.ingredients[index] = { ...after.ingredients[index], amount: change.amount };
        } else {
          if (index >= 0) throw new AppError(`Інгредієнт «${change.title}» вже є у складі. Вкажіть зміну кількості.`);
          after.ingredients.push(await resolveIngredient({ ...change, amount: change.amount }, cache, resolution, `change:${changeIndex}`));
        }
      }
    }
  }
  checkComposition(after.ingredients);
  if (JSON.stringify(before) === JSON.stringify(after)) throw new NoChangesError(`Змін не потрібно. Рецепт «${record.title}» уже має потрібні значення.`);
  const preview: InventoryMutationPreview = { kind: intent.kind, target: identity, before, after };
  return { kind: "ready" as const, preview };
}
