"use server";

import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";
import { prisma } from "../prisma";
import {
  IIngredient,
  IIngredientCategory,
  ingredientArgs,
} from "../prisma.args";
import { requireAdmin } from "../auth";
import { uploadHelper } from "../s3/upload.helper";
import { AppError } from "../error";

export const getIngredients = async (): Promise<IIngredient[]> => {
  try {
    return prisma.ingredient.findMany(ingredientArgs);
  } catch (e) {
    console.error("Database error in getIngredients:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const getIngredientCategories = async (): Promise<
  IIngredientCategory[]
> => {
  try {
    const categories = await prisma.ingredientCategory.findMany();
    return categories;
  } catch (e) {
    console.error("Database error in getIngredientCategories:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const createIngredientCategory = async (
  dto: ICreateIngredientCategoryDto,
) => {
  try {
    await requireAdmin();
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new AppError("A category with this title already exists.");
    const newCategory = await prisma.ingredientCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createIngredientCategory:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const createIngredient = async (
  dto: IIngredientFormValues,
): Promise<IIngredient> => {
  try {
    const { categoryId, title } = dto;
    await requireAdmin();
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory)
      throw new AppError(`A category #${categoryId} not found`);

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { title },
    });
    if (existingIngredient)
      throw new AppError("An ingredient with this title already exists.");

    const newIngredient = await prisma.ingredient.create({
      data: dto,
      ...ingredientArgs,
    });
    return newIngredient;
  } catch (e) {
    console.error("Database error in updateRecipeFields:", e);

    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const editIngredient = async (
  id: number,
  dto: IIngredientFormValues,
): Promise<IIngredient> => {
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
    return prisma.ingredient.update({
      where: { id },
      data: dto,
      ...ingredientArgs,
    });
  } catch (e) {
    console.error("Database error in updateIngredient:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const deleteIngredient = async (id: number) => {
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
    return prisma.ingredient.delete({
      where: { id },
      ...ingredientArgs,
    });
  } catch (e) {
    console.error("Database error in deleteIngredient:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const toggleSavedIngredient = async (
  id: number,
  isSaved: boolean,
): Promise<IIngredient> => {
  try {
    await requireAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient) throw new AppError("Ingredient not found");
    return prisma.ingredient.update({
      where: { id },
      data: { isSaved },
      ...ingredientArgs,
    });
  } catch (e) {
    console.error("Database error in toggleSavedIngredient:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const uploadIngredientImage = async (
  ingredientId: number,
  file: File,
): Promise<IIngredient> => {
  try {
    await requireAdmin();
    const imageKey = await uploadHelper.ingredientImage(ingredientId, file);
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        imageKey,
        imageVersion: { increment: 1 },
      },
      ...ingredientArgs,
    });
    return updatedIngredient;
  } catch (e) {
    console.error("Database error in uploadIngredientImage:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const removeIngredientImage = async (
  ingredientId: number,
): Promise<IIngredient> => {
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
    return updatedIngredient;
  } catch (e) {
    console.error("Database error in removeIngredientImage:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const toggleIngredientInStockValue = async (
  id: number,
  isInStock: boolean,
): Promise<IIngredient> => {
  try {
    await requireAdmin();
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!existingIngredient) throw new AppError("Ingredient not found");
    return prisma.ingredient.update({
      where: { id },
      data: { isInStock },
      ...ingredientArgs,
    });
  } catch (e) {
    console.error("Database error in toggleIngredientInStockValue:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};
