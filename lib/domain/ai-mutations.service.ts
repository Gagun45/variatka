import type { InventoryMutationIntent, InventoryMutationPreview } from "@/zod/ai-mutation.schema";
import { ingredientWriteSchema, stuffWriteSchema } from "@/zod/ai-mutation.schema";
import type { RecordSelection } from "@/zod/ai-search.schema";
import type { InventorySearchResult } from "../ai/inventory.types";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { searchInventory } from "./ai-inventory.service";
import { ingredientWrites, stuffWrites } from "./inventory-write.service";
import { assertNever, mutationDefinitions } from "../ai/mutation-definitions";

type PreparedMutation =
  | { kind: "ready"; preview: InventoryMutationPreview }
  | { kind: "choose"; intent: InventoryMutationIntent; results: InventorySearchResult };

const notEmpty = (value: unknown) => value !== null;
const patchValues = (patch: object) => Object.fromEntries(Object.entries(patch).filter(([, value]) => notEmpty(value)));

function ensureChanged(before: object, after: object) {
  if (JSON.stringify(before) === JSON.stringify(after)) throw new AppError("Запис уже має ці значення. Змін не потрібно.");
}

export async function prepareInventoryMutation(intent: InventoryMutationIntent, selected: RecordSelection | null, explicitlyChosen = false): Promise<PreparedMutation> {
  switch (intent.kind) {
    case "createIngredient": return { kind: "ready", preview: { kind: intent.kind, after: intent.data } };
    case "createStuff": return { kind: "ready", preview: { kind: intent.kind, after: intent.data } };
    case "updateIngredient": case "deleteIngredient": case "updateStuff": case "deleteStuff": break;
    default: return assertNever(intent);
  }
  const entity = mutationDefinitions[intent.kind].entity;
  let selection = selected;
  if (intent.targetName !== null && !explicitlyChosen) {
    // Only a unique exact title is resolved automatically. Other matches require selection.
    const where = { title: { equals: intent.targetName, mode: "insensitive" as const } };
    const exact = entity === "ingredient"
      ? await prisma.ingredient.findMany({ where, take: 2, select: { id: true } })
      : await prisma.stuff.findMany({ where, take: 2, select: { id: true } });
    if (exact.length === 1) selection = { entity, id: exact[0].id };
    else {
      const results = await searchInventory(entity === "ingredient"
        ? { entity, text: intent.targetName, category: null, isInStock: null, isSaved: null }
        : { entity, text: intent.targetName, category: null, isInStock: null, stockMin: null, stockMax: null });
      if (!results.items.length) throw new AppError("Запис не знайдено. Уточніть назву або спочатку знайдіть та оберіть запис.");
      return { kind: "choose", intent, results };
    }
  }
  if (!selection || selection.entity !== entity) throw new AppError("Спочатку оберіть потрібний інгредієнт або матеріал. Рецепти поки не можна змінювати.");

  if (entity === "ingredient" && (intent.kind === "updateIngredient" || intent.kind === "deleteIngredient")) {
    const record = await prisma.ingredient.findUnique({ where: { id: selection.id }, select: {
      id: true, updatedAt: true, title: true, description: true, category: true, isInStock: true, isSaved: true,
      _count: { select: { recipeIngredients: true } },
    } });
    if (!record) throw new AppError("Інгредієнт більше не існує. Повторіть пошук.");
    const { id, updatedAt, _count, ...data } = record;
    const before = ingredientWriteSchema.parse(data);
    const target = { id, title: record.title, updatedAt: updatedAt.toISOString() };
    if (intent.kind === "deleteIngredient") {
      if (_count.recipeIngredients > 0) throw new AppError("Неможливо видалити інгредієнт, який використовується в рецептах.");
      return { kind: "ready", preview: { kind: intent.kind, target, before } };
    }
    const after = ingredientWriteSchema.parse({ ...before, ...patchValues(intent.patch) });
    ensureChanged(before, after);
    return { kind: "ready", preview: { kind: intent.kind, target, before, after } };
  }

  if (intent.kind !== "updateStuff" && intent.kind !== "deleteStuff") throw new AppError("Непідтримувана операція.");
  const record = await prisma.stuff.findUnique({ where: { id: selection.id }, select: { id: true, updatedAt: true, title: true, description: true, category: true, inStock: true } });
  if (!record) throw new AppError("Матеріал більше не існує. Повторіть пошук.");
  const { id, updatedAt, ...data } = record;
  const before = stuffWriteSchema.parse(data);
  const target = { id, title: record.title, updatedAt: updatedAt.toISOString() };
  if (intent.kind === "deleteStuff") return { kind: "ready", preview: { kind: intent.kind, target, before } };
  const { stock, ...patch } = intent.patch;
  const inStock = stock ? (stock.mode === "adjust" ? before.inStock + stock.value : stock.value) : before.inStock;
  if (!Number.isSafeInteger(inStock) || inStock < 0 || inStock > 2_147_483_647) {
    throw new AppError("Залишок має бути цілим числом від 0 до 2147483647. Списання не може перевищувати поточний залишок.");
  }
  const after = stuffWriteSchema.parse({ ...before, ...patchValues(patch), inStock });
  ensureChanged(before, after);
  return { kind: "ready", preview: { kind: intent.kind, target, before, after } };
}

export async function applyInventoryMutation(preview: InventoryMutationPreview) {
  const entity = mutationDefinitions[preview.kind].entity;
  switch (preview.kind) {
    case "createIngredient": {
      const record = await ingredientWrites.create(preview.after);
      return { operation: "created" as const, entity, id: record.id, title: record.title };
    }
    case "createStuff": {
      const record = await stuffWrites.create(preview.after);
      return { operation: "created" as const, entity, id: record.id, title: record.title };
    }
    case "updateIngredient": {
      const record = await ingredientWrites.update(preview.target.id, preview.after, preview.target.updatedAt);
      return { operation: "updated" as const, entity, id: record.id, title: record.title };
    }
    case "updateStuff": {
      const record = await stuffWrites.update(preview.target.id, preview.after, preview.target.updatedAt);
      return { operation: "updated" as const, entity, id: record.id, title: record.title };
    }
    case "deleteIngredient":
      await ingredientWrites.delete(preview.target.id, preview.target.updatedAt);
      return { operation: "deleted" as const, entity, id: preview.target.id, title: preview.target.title };
    case "deleteStuff":
      await stuffWrites.delete(preview.target.id, preview.target.updatedAt);
      return { operation: "deleted" as const, entity, id: preview.target.id, title: preview.target.title };
    default: return assertNever(preview);
  }
}
