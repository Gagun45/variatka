"use server";

import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IIngredient, ingredientArgs } from "../prisma.args";
import { uploadHelper } from "../s3/upload.helper";
import { IActionResponse } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { requireAdmin } from "./user.actions";

export const getIngredients = async (): Promise<
  IActionResponse<IIngredient[]>
> => {
  try {
    const ingredients = await prisma.ingredient.findMany(ingredientArgs);
    return {
      ok: true,
      data: ingredients,
    };
  } catch (e) {
    console.error("Error in getIngredients:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const createIngredient = async (
  dto: IIngredientFormValues,
): Promise<IActionResponse<IIngredient>> => {
  try {
    await requireAdmin();
    const { title } = dto;

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { title },
    });
    if (existingIngredient)
      throw new AppError("An ingredient with this title already exists.");

    const newIngredient = await prisma.ingredient.create({
      data: dto,
      ...ingredientArgs,
    });
    return {
      ok: true,
      data: newIngredient,
    };
  } catch (e) {
    console.error("Error in updateRecipeFields:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const editIngredient = async (
  id: number,
  dto: IIngredientFormValues,
): Promise<IActionResponse<IIngredient>> => {
  try {
    await requireAdmin();
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id,
        },
      },
    });
    if (existingIngredient)
      throw new AppError("An ingredient with this title already exists.");
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: dto,
      ...ingredientArgs,
    });
    return {
      ok: true,
      data: updatedIngredient,
    };
  } catch (e) {
    console.error("Error in updateIngredient:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const deleteIngredient = async (
  id: number,
): Promise<IActionResponse<number>> => {
  try {
    await requireAdmin();
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            recipeIngredients: true,
          },
        },
      },
    });
    if (!ingredient) throw new AppError("Ingredient not found");

    if (ingredient._count.recipeIngredients > 0)
      throw new AppError("Cannot delete ingredients used in recipes");
    await prisma.ingredient.delete({
      where: { id },
    });
    return {
      data: id,
      ok: true,
    };
  } catch (e) {
    console.error("Error in deleteIngredient:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleSavedIngredient = async (
  id: number,
  isSaved: boolean,
): Promise<IActionResponse<IIngredient>> => {
  try {
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
    return {
      ok: true,
      data: updatedIngredient,
    };
  } catch (e) {
    console.error("Error in toggleSavedIngredient:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const uploadIngredientImage = async (
  ingredientId: number,
  file: File,
): Promise<IActionResponse<IIngredient>> => {
  try {
    await requireAdmin();
    const imageKey = await uploadHelper.image({
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
    return {
      ok: true,
      data: updatedIngredient,
    };
  } catch (e) {
    console.error("Error in uploadIngredientImage:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const removeIngredientImage = async (
  ingredientId: number,
): Promise<IActionResponse<IIngredient>> => {
  try {
    await requireAdmin();
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        imageKey: null,
        imageVersion: { increment: 1 },
      },
      ...ingredientArgs,
    });
    return {
      ok: true,
      data: updatedIngredient,
    };
  } catch (e) {
    console.error("Error in removeIngredientImage:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleIngredientInStockValue = async (
  id: number,
  isInStock: boolean,
): Promise<IActionResponse<IIngredient>> => {
  try {
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
    return {
      ok: true,
      data: updatedIngredient,
    };
  } catch (e) {
    console.error("Error in toggleIngredientInStockValue:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
