import { WriteResolution } from "./ai-resolution.service";
import { MAX_BATCH_OPERATIONS, type BatchIntent, type BatchPreview } from "@/zod/ai-batch.schema";
import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import type { RecipeSnapshot } from "@/zod/ai-recipe.schema";
import { assertNever } from "../ai/mutation-definitions";
import { AppError, NoChangesError } from "../error";
import { prisma } from "../prisma";
import { prepareInventoryMutation, applyInventoryMutation } from "./ai-mutations.service";
import { searchInventory } from "./ai-inventory.service";
import { cleanupInventoryImages, guarded } from "./inventory-write.service";
import type { IngredientResolutionCache } from "./ai-recipe.service";
import { validateIngredientDuplicateReview } from "./ai-ingredient-duplicates.service";
import { completeBatchPreview } from "../ai/batch-preview";

const key = (title: string) => title.toLocaleLowerCase("uk");
export { completeBatchPreview } from "../ai/batch-preview";

export async function prepareInventoryBatch(intent: BatchIntent, selected: RecordSelection | null, resolution?: WriteResolution): Promise<BatchPreview> {
  const state = resolution ?? new WriteResolution({ decisions: [] });
  const reused = new Map<number, string>();
  const creations = new Map<number, InventoryMutationPreview>();
  const cache: IngredientResolutionCache = new Map();
  const items: InventoryMutationPreview[] = [];
  const unchanged: string[] = [];
  const operations: { intent: InventoryMutationIntent; selected: RecordSelection | null; chosen: boolean }[] = [];
  if (intent.kind === "list") {
    // Resolve explicit creations before recipes, even if a recipe appears first.
    for (const [index, operation] of intent.operations.entries()) {
      if (operation.kind === "createIngredient") {
        const { existing, review } = await state.ingredientCreation(operation.data.title, `${index}:createIngredient`);
        if (existing) {
          reused.set(index, `«${operation.data.title}»: використано наявний «${existing.title}», його дані не змінено`);
          cache.set(operation.data.title, { id: existing.id, updatedAt: existing.updatedAt.toISOString(), title: existing.title, category: existing.category, amount: "" });
        } else {
          cache.set(operation.data.title, { id: null, updatedAt: null, title: operation.data.title, category: operation.data.category, amount: "" });
          creations.set(index, { kind: "createIngredient", after: operation.data, ...(review ? { duplicateReview: review } : {}) });
        }
      }
      operations.push({ intent: operation, selected, chosen: false });
    }
  } else {
    const expectedEntity = { updateIngredients: "ingredient", deleteIngredients: "ingredient", updateStuff: "stuff", deleteStuff: "stuff", updateRecipes: "recipe", deleteRecipes: "recipe" }[intent.change.kind];
    if (intent.search.entity !== expectedEntity) throw new AppError("Тип пошуку не відповідає пакетній операції.");
    const results = state.targets ? { items: state.targets, hasMore: false } : await searchInventory(intent.search);
    if (results.hasMore) throw new AppError(`Знайдено більше ${MAX_BATCH_OPERATIONS} записів. Звузьте фільтри; пакет не буде обрізано автоматично.`);
    if (!results.items.length) throw new AppError("За цими фільтрами не знайдено записів.");
    if (results.items.some((item) => item.entity !== expectedEntity)) throw new AppError("Тип збережених записів не відповідає пакетній операції.");
    state.targets = results.items.map(({ entity, id }) => ({ entity, id }));
    for (const item of results.items) {
      const change = intent.change;
      let operation: InventoryMutationIntent;
      switch (change.kind) {
        case "updateIngredients": operation = { kind: "updateIngredient", targetName: null, patch: change.patch }; break;
        case "updateStuff": operation = { kind: "updateStuff", targetName: null, patch: change.patch }; break;
        case "updateRecipes": operation = { kind: "updateRecipe", targetName: null, patch: change.patch, composition: null }; break;
        case "deleteIngredients": operation = { kind: "deleteIngredient", targetName: null }; break;
        case "deleteStuff": operation = { kind: "deleteStuff", targetName: null }; break;
        case "deleteRecipes": operation = { kind: "deleteRecipe", targetName: null }; break;
        default: return assertNever(change);
      }
      operations.push({ intent: operation, selected: { entity: item.entity, id: item.id }, chosen: true });
    }
  }
  for (const [index, operation] of operations.entries()) {
    if (reused.has(index)) { unchanged.push(reused.get(index)!); continue; }
    if (creations.has(index)) { items.push(creations.get(index)!); continue; }
    try {
      const prepared = await prepareInventoryMutation(operation.intent, operation.selected, operation.chosen, true, cache, { state, index });
      items.push(prepared.preview);
    } catch (error) {
      if (!(error instanceof NoChangesError)) throw error;
      unchanged.push("targetName" in operation.intent ? operation.intent.targetName ?? `${operation.selected?.entity} #${operation.selected?.id}` : "Без змін");
    }
  }
  return { ...completeBatchPreview(items, unchanged), ...(state.targets ? { targets: state.targets } : {}) };
}

export async function applyInventoryBatch(preview: BatchPreview) {
  // Revalidate dependencies/limits at confirmation, including browser payloads.
  const normalized = completeBatchPreview(preview.items, preview.unchanged);
  if (normalized.items.length !== preview.items.length) throw new AppError("У перегляді відсутні операції створення інгредієнтів. Повторіть запит.");
  const cleanup: string[] = [];
  const results = await guarded(() => prisma.$transaction(async (tx) => {
    if (preview.targets) {
      const identities = preview.targets.map(({ entity, id }) => `${entity}:${id}`);
      if (new Set(identities).size !== identities.length) throw new AppError("Повторні записи у пропозиції. Підготуйте новий перегляд.");
      for (const target of preview.targets) {
        const args = { where: { id: target.id }, select: { id: true } } as const;
        const current = target.entity === "ingredient" ? await tx.ingredient.findUnique(args) : target.entity === "stuff" ? await tx.stuff.findUnique(args) : await tx.recipe.findUnique(args);
        if (!current) throw new AppError("Запис із початкового переліку змін було видалено. Підготуйте новий перегляд; перелік не буде скорочено автоматично.", "STALE_PREVIEW");
      }
    }
    // Recheck edited titles and newly appeared candidates before any writes.
    for (const item of normalized.items) if (item.kind === "createIngredient") await validateIngredientDuplicateReview(item, tx);
    const newIds = new Map<string, number>();
    // Validate references before applying our own ingredient edits in this transaction.
    const references = new Map<number, string>();
    for (const item of normalized.items) if (item.kind === "createRecipe" || item.kind === "updateRecipe") {
      for (const ingredient of item.after.ingredients) if (ingredient.id !== null) {
        if (!ingredient.updatedAt) throw new AppError("Некоректна версія інгредієнта.");
        const previous = references.get(ingredient.id);
        if (previous && previous !== ingredient.updatedAt) throw new AppError("Інгредієнт змінився під час підготовки пакета. Повторіть запит.", "STALE_PREVIEW");
        references.set(ingredient.id, ingredient.updatedAt);
      }
    }
    for (const [id, version] of references) {
      const current = await tx.ingredient.findUnique({ where: { id }, select: { updatedAt: true } });
      if (!current || current.updatedAt.toISOString() !== version) throw new AppError("Інгредієнт рецепта змінився або видалений. Повторіть запит.", "STALE_PREVIEW");
    }
    const resolveItems = async (snapshot: RecipeSnapshot) => snapshot.ingredients.map((item) => {
      const ingredientId = item.id ?? newIds.get(key(item.title));
      if (!ingredientId) throw new AppError(`Не створено інгредієнт «${item.title}».`);
      return { ingredientId, amount: item.amount };
    });
    const applied = [];
    for (const item of normalized.items) {
      const result = await applyInventoryMutation(item, tx, cleanup, resolveItems);
      if (item.kind === "createIngredient") newIds.set(key(item.after.title), result.id);
      applied.push(result);
    }
    return applied;
  }, { isolationLevel: "Serializable", maxWait: 5000, timeout: 15000 }));
  // Storage is not transactional. Never remove files for a transaction that rolled back.
  await cleanupInventoryImages(cleanup);
  return { results };
}
