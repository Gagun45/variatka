import type { Prisma } from "@prisma/client";
import { recipeWriteSchema, type RecipeWrite } from "@/zod/ai-recipe.schema";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { recipeArgs } from "../prisma.args";
import type { IRecipeIngredient } from "../types";
import { normalizeRecipeIngredients, recipeIngredientsService } from "./recipe-ingredients.service";
import { cleanupInventoryImages, guarded, nextVersion, versionWhere } from "./inventory-write.service";

function fields(data: unknown) {
  const result = recipeWriteSchema.safeParse(data);
  if (!result.success) throw new AppError("Перевірте поля рецепта: назву, категорію, серію та цілу гостроту від 0 до 4.");
  return result.data;
}

export async function createRecipeInTransaction(tx: Prisma.TransactionClient, data: RecipeWrite, items: IRecipeIngredient[]) {
  const parsed = fields(data);
  parsed.title = parsed.title.trim();
  const normalized = normalizeRecipeIngredients(items);
  return guarded(() => tx.recipe.create({
    data: { ...parsed, ingredients: { create: normalized.map((item) => ({ ingredientId: item.ingredientId, amount: item.amount })) } }, ...recipeArgs,
  }));
}

export async function updateRecipeInTransaction(tx: Prisma.TransactionClient, id: number, data: RecipeWrite, items?: IRecipeIngredient[], expectedUpdatedAt?: string) {
  const parsed = fields(data);
  const current = await tx.recipe.findUnique({ where: versionWhere(id), select: { updatedAt: true } });
  if (!current) throw new AppError("Рецепт не знайдено.");
  const version = expectedUpdatedAt ?? current.updatedAt.toISOString();
  // Lock and advance the parent before touching composition. All writers follow this order.
  await guarded(() => tx.recipe.update({ where: versionWhere(id, version), data: { ...parsed, ...nextVersion(version) } }));
  if (items !== undefined) await recipeIngredientsService.replaceInTransaction(tx, id, items, false);
  return tx.recipe.findUniqueOrThrow({ where: { id }, ...recipeArgs });
}

export async function deleteRecipeInTransaction(tx: Prisma.TransactionClient, id: number, expectedUpdatedAt?: string, cleanup: string[] = []) {
  const record = await tx.recipe.findUnique({ where: versionWhere(id), select: { _count: { select: { orderItems: true } } } });
  if (!record) throw new AppError("Рецепт не знайдено або видалено.");
  if (record._count.orderItems > 0) throw new AppError("Неможливо видалити рецепт, використаний у замовленнях.");
  const deleted = await guarded(() => tx.recipe.delete({ where: { ...versionWhere(id, expectedUpdatedAt), orderItems: { none: {} } }, select: { imageKey: true } }));
  if (deleted.imageKey) cleanup.push(deleted.imageKey);
  return id;
}

export const recipeWrites = {
  create: (data: RecipeWrite, items: IRecipeIngredient[]) => prisma.$transaction((tx) => createRecipeInTransaction(tx, data, items)),
  update: (id: number, data: Omit<RecipeWrite, "isSaved" | "confirmationNotes"> & Partial<Pick<RecipeWrite, "isSaved" | "confirmationNotes">>, items?: IRecipeIngredient[]) => prisma.$transaction(async (tx) => {
    const current = await tx.recipe.findUnique({ where: versionWhere(id), select: { isSaved: true, confirmationNotes: true } });
    if (!current) throw new AppError("Рецепт не знайдено.");
    return updateRecipeInTransaction(tx, id, { ...data, isSaved: data.isSaved ?? current.isSaved, confirmationNotes: data.confirmationNotes === undefined ? current.confirmationNotes : data.confirmationNotes }, items);
  }),
  delete: async (id: number) => {
    const cleanup: string[] = [];
    await prisma.$transaction((tx) => deleteRecipeInTransaction(tx, id, undefined, cleanup));
    await cleanupInventoryImages(cleanup);
    return id;
  },
};
