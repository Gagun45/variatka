"use server";

import { RecipeVariant } from "@prisma/client";

import {
  createRecipeVariantSchema,
  ICreateRecipeVariantDto,
  recipeVariantStockSchema,
} from "@/zod/recipe-variant.schema";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IActionResponse } from "../types";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";

const assertValidId = (id: number, entity: string) => {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`${entity} not found`);
  }
};

export const createRecipeVariant = async (
  recipeId: number,
  dto: ICreateRecipeVariantDto,
): Promise<IActionResponse<RecipeVariant>> => {
  return safeAction("createRecipeVariant", async () => {
    await requireAdmin();
    assertValidId(recipeId, "Recipe");

    const parsed = createRecipeVariantSchema.safeParse(dto);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Invalid recipe variant",
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });
    if (!recipe) throw new AppError("Recipe not found");

    const existingVariant = await prisma.recipeVariant.findUnique({
      where: {
        recipeId_label: {
          recipeId,
          label: parsed.data.label,
        },
      },
      select: { id: true },
    });
    if (existingVariant) {
      throw new AppError(
        "A variant with this label already exists for this recipe.",
      );
    }

    return prisma.recipeVariant.create({
      data: {
        recipeId,
        ...parsed.data,
      },
    });
  });
};

export const deleteRecipeVariant = async (
  id: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteRecipeVariant", async () => {
    await requireAdmin();
    assertValidId(id, "Recipe variant");

    const variant = await prisma.recipeVariant.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { orderItems: true },
        },
      },
    });
    if (!variant) throw new AppError("Recipe variant not found");
    if (variant._count.orderItems > 0) {
      throw new AppError("Cannot delete a variant used in orders.");
    }

    await prisma.recipeVariant.delete({
      where: { id },
    });

    return id;
  });
};

export const updateRecipeVariantStock = async (
  id: number,
  inStock: number,
): Promise<IActionResponse<RecipeVariant>> => {
  return safeAction("updateRecipeVariantStock", async () => {
    await requireAdmin();
    assertValidId(id, "Recipe variant");

    const parsedStock = recipeVariantStockSchema.safeParse(inStock);
    if (!parsedStock.success) {
      throw new AppError(
        parsedStock.error.issues[0]?.message ?? "Invalid stock value",
      );
    }

    const variant = await prisma.recipeVariant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!variant) throw new AppError("Recipe variant not found");

    return prisma.recipeVariant.update({
      where: { id },
      data: { inStock: parsedStock.data },
    });
  });
};
