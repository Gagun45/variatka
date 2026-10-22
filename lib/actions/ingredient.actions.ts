"use server";

import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IIngredient, ingredientArgs } from "../prisma.args";
import { storageHelper } from "../r2/storage.helper";
import { IActionResponse } from "../types";
import { safeAction } from "./action.wrapper";
import { requireAdmin } from "./user.actions";
import { ingredientWrites } from "../domain/inventory-write.service";

export const getIngredients = async (): Promise<
  IActionResponse<IIngredient[]>
> => {
  return safeAction("getIngredients", async () => {
    const ingredients = await prisma.ingredient.findMany(ingredientArgs);
    return ingredients;
  });
};

export const getIngredientTitle = async (
  id: number,
): Promise<IActionResponse<string>> => {
  return safeAction("getIngredientTitle", async () => {
    await requireAdmin();

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Ingredient not found");
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!ingredient) throw new AppError("Ingredient not found");
    return ingredient.title;
  });
};

export const createIngredient = async (
  dto: IIngredientFormValues,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("createIngredient", async () => {
    await requireAdmin();
    return ingredientWrites.create({ ...dto, isSaved: false });
  });
};

export const editIngredient = async (
  id: number,
  dto: IIngredientFormValues,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("editIngredient", async () => {
    await requireAdmin();
    return ingredientWrites.update(id, dto);
  });
};

export const deleteIngredient = async (
  id: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteIngredient", async () => {
    await requireAdmin();
    return ingredientWrites.delete(id);
  });
};

export const toggleSavedIngredient = async (
  id: number,
  isSaved: boolean,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("toggleSavedIngredient", async () => {
    await requireAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient) throw new AppError("Ingredient not found");

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: { isSaved },
      ...ingredientArgs,
    });
    return updatedIngredient;
  });
};

export const uploadIngredientImage = async (
  ingredientId: number,
  file: File,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("uploadIngredientImage", async () => {
    await requireAdmin();
    const imageKey = await storageHelper.image({
      entity: "ingredients",
      file,
      id: ingredientId,
    });
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        imageKey,
        imageVersion: { increment: 1 },
      },
      ...ingredientArgs,
    });
    return updatedIngredient;
  });
};

export const removeIngredientImage = async (
  ingredientId: number,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("removeIngredientImage", async () => {
    await requireAdmin();
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { imageKey: true },
    });
    if (!ingredient) throw new AppError("Ingredient not found");
    if (ingredient.imageKey) await storageHelper.delete(ingredient.imageKey);
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        imageKey: null,
        imageVersion: { increment: 1 },
      },
      ...ingredientArgs,
    });
    return updatedIngredient;
  });
};

export const toggleIngredientInStockValue = async (
  id: number,
  isInStock: boolean,
): Promise<IActionResponse<IIngredient>> => {
  return safeAction("toggleIngredientInStockValue", async () => {
    await requireAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient) throw new AppError("Ingredient not found");
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: { isInStock },
      ...ingredientArgs,
    });
    return updatedIngredient;
  });
};
