"use server";

import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";
import { userIsAdmin } from "../auth";
import { AppError } from "../error";
import { prisma } from "../prisma";
import {
  IIngredient,
  IIngredientCategory,
  ingredientArgs,
} from "../prisma.args";
import { uploadHelper } from "../s3/upload.helper";
import { IActionResponse } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";

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

export const getIngredientCategories = async (): Promise<
  IActionResponse<IIngredientCategory[]>
> => {
  try {
    const categories = await prisma.ingredientCategory.findMany();
    return {
      ok: true,
      data: categories,
    };
  } catch (e) {
    console.error("Error in getIngredientCategories:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const createIngredientCategory = async (
  dto: ICreateIngredientCategoryDto,
): Promise<IActionResponse<IIngredientCategory>> => {
  try {
    await userIsAdmin();
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      return {
        ok: false,
        message: "A category with this title already exists.",
      };
    const newCategory = await prisma.ingredientCategory.create({ data: dto });

    return {
      ok: true,
      data: newCategory,
    };
  } catch (e) {
    console.error("Error in createIngredientCategory:", e);
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
    await userIsAdmin();
    const { categoryId, title } = dto;
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory)
      return {
        ok: false,
        message: `A category #${categoryId} not found`,
      };

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { title },
    });
    if (existingIngredient)
      return {
        ok: false,
        message: "An ingredient with this title already exists.",
      };

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
    await userIsAdmin();
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id,
        },
      },
    });
    if (existingIngredient)
      return {
        ok: false,
        message: "An ingredient with this title already exists.",
      };
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
    await userIsAdmin();
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
    if (!ingredient)
      return {
        ok: false,
        message: "Ingredient not found",
      };

    if (ingredient._count.recipeIngredients > 0)
      return {
        ok: false,
        message: "Cannot delete ingredients used in recipes",
      };
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
    await userIsAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient)
      return {
        ok: false,
        message: "Ingredient not found",
      };

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
    await userIsAdmin();
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
    await userIsAdmin();
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
    await userIsAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient)
      return {
        ok: false,
        message: "Ingredient not found",
      };
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
