"use server";

import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";
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
import { Prisma } from "@prisma/client";
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
    await requireAdmin();
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new AppError("A category with this title already exists.");
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
    await requireAdmin();
    const { categoryId, title } = dto;
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) throw new AppError("Category not found");

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

export const deleteIngredientCategory = async (
  id: number,
): Promise<IActionResponse<number>> => {
  try {
    await requireAdmin();
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            ingredients: true,
          },
        },
      },
    });
    if (!existingCategory) throw new AppError("Category not found");
    if (existingCategory._count.ingredients > 0)
      throw new AppError("Category has items, cannot be deleted");
    await prisma.ingredientCategory.delete({
      where: { id },
    });
    return {
      ok: true,
      data: id,
    };
  } catch (e) {
    console.error("Error in deleteIngredientCategory:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const editIngredientCategory = async (
  id: number,
  dto: ICreateIngredientCategoryDto,
): Promise<IActionResponse<IIngredientCategory>> => {
  try {
    await requireAdmin();

    const updatedCategory = await prisma.ingredientCategory.update({
      where: { id },
      data: dto,
    });
    return {
      ok: true,
      data: updatedCategory,
    };
  } catch (e) {
    console.error("Error in editIngredientCategory:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ACTION_ERROR("Category not found");
      }
      if (e.code === "P2002") {
        return ACTION_ERROR("Category with the same title already exists");
      }
    }
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
