import type { Prisma } from "@prisma/client";
import z from "zod";
import { ingredientWriteSchema, stuffWriteSchema, inventoryIdSchema, inventoryVersionSchema, inventoryTitleInputSchema, type IngredientWrite, type StuffWrite } from "@/zod/ai-mutation.schema";
import { AppError } from "../error";
import { ingredientArgs, stuffArgs } from "../prisma.args";
import { prisma } from "../prisma";
import { storageHelper } from "../r2/storage.helper";

const staleMessage = "Запис змінився або був видалений. Повторіть запит та перевірте новий перегляд.";

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new AppError("Перевірте поля: назва, категорія, наявність та цілий невід’ємний залишок.");
  return result.data;
}

export function versionWhere(id: number, expectedUpdatedAt?: string) {
  parse(inventoryIdSchema, id);
  return { id, ...(expectedUpdatedAt !== undefined && { updatedAt: new Date(parse(inventoryVersionSchema, expectedUpdatedAt)) }) };
}

export function nextVersion(expectedUpdatedAt?: string) {
  // Always advance even if two confirmations land in the same millisecond.
  return expectedUpdatedAt === undefined ? {} : { updatedAt: new Date(Math.max(Date.now(), Date.parse(expectedUpdatedAt) + 1)) };
}

export async function guarded<T>(write: () => Promise<T>): Promise<T> {
  try { return await write(); } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code === "P2002") throw new AppError("Запис із такою назвою вже існує.", "CONFLICT");
    if (code === "P2025") throw new AppError(staleMessage, "STALE_PREVIEW");
    if (code === "P2003") throw new AppError("Запис використовується в рецептах або замовленнях. Видалення неможливе.", "CONFLICT");
    if (code === "P2034") throw new AppError("Дані змінилися під час збереження. Повторіть запит і перевірте новий перегляд.", "STALE_PREVIEW");
    throw error;
  }
}

// Shared by ordinary admin forms and AI confirmation. Callers must requireAdmin first.
export const ingredientWrites = {
  create: async (data: IngredientWrite, db: Prisma.TransactionClient = prisma) => {
    const parsed = parse(ingredientWriteSchema.extend({ title: inventoryTitleInputSchema }), data);
    return guarded(() => db.ingredient.create({ data: parsed, ...ingredientArgs }));
  },
  update: async (id: number, data: Omit<IngredientWrite, "isSaved"> & { isSaved?: boolean }, expectedUpdatedAt?: string, db: Prisma.TransactionClient = prisma) => {
    const where = versionWhere(id, expectedUpdatedAt);
    const parsed = parse(ingredientWriteSchema.partial({ isSaved: true }), data);
    return guarded(() => db.ingredient.update({ where, data: { ...parsed, ...nextVersion(expectedUpdatedAt) }, ...ingredientArgs }));
  },
  delete: async (id: number, expectedUpdatedAt?: string, db: Prisma.TransactionClient = prisma, cleanup?: string[]) => {
    const where = versionWhere(id, expectedUpdatedAt);
    const record = await db.ingredient.findUnique({ where: { id }, select: { imageKey: true, _count: { select: { recipeIngredients: true } } } });
    if (!record) throw new AppError(staleMessage, "STALE_PREVIEW");
    if (record._count.recipeIngredients > 0) throw new AppError("Неможливо видалити інгредієнт, який використовується в рецептах.", "CONFLICT");
    // Relation predicate + FK prevent deleting an ingredient attached after the pre-check.
    const deleted = await guarded(() => db.ingredient.delete({ where: { ...where, recipeIngredients: { none: {} } }, select: { imageKey: true } }));
    // Delete the DB row first: a failed/stale delete must never remove its image.
    if (deleted.imageKey) {
      if (cleanup) cleanup.push(deleted.imageKey);
      else await cleanupInventoryImages([deleted.imageKey]);
    }
    return id;
  },
};

export const stuffWrites = {
  create: async (data: StuffWrite, db: Prisma.TransactionClient = prisma) => {
    const parsed = parse(stuffWriteSchema.extend({ title: inventoryTitleInputSchema }), data);
    return guarded(() => db.stuff.create({ data: parsed, ...stuffArgs }));
  },
  update: async (id: number, data: Omit<StuffWrite, "description"> & { description?: string | null }, expectedUpdatedAt?: string, db: Prisma.TransactionClient = prisma) => {
    const where = versionWhere(id, expectedUpdatedAt);
    const parsed = parse(stuffWriteSchema.partial({ description: true }), data);
    return guarded(() => db.stuff.update({ where, data: { ...parsed, ...nextVersion(expectedUpdatedAt) }, ...stuffArgs }));
  },
  delete: async (id: number, expectedUpdatedAt?: string, db: Prisma.TransactionClient = prisma) => {
    const where = versionWhere(id, expectedUpdatedAt);
    await guarded(() => db.stuff.delete({ where }));
    return id;
  },
};

export async function cleanupInventoryImages(keys: string[]) {
  for (const key of keys) {
    try { await storageHelper.delete(key); }
    catch { console.error("Could not clean up an image after a committed inventory deletion"); }
  }
}
