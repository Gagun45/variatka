"use server";

import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";
import { prisma } from "../prisma";
import { IRecipe, IRecipeCategory, recipeArgs } from "../prisma.args";
import { ICreateRecipeDto, IRecipeIngredient } from "../types";
import { requireAdmin } from "../auth";
import { AppError } from "../error";

export const getRecipeCategories = async (): Promise<IRecipeCategory[]> => {
  try {
    const categories = await prisma.recipeCategory.findMany();
    return categories;
  } catch (e) {
    console.error("Database error in getRecipeCategories:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const getRecipes = async (): Promise<IRecipe[]> => {
  try {
    const recipes = await prisma.recipe.findMany(recipeArgs);
    return recipes;
  } catch (e) {
    console.error("Database error in getRecipes:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const createRecipeCategory = async (dto: ICreateRecipeCategoryDto) => {
  try {
    await requireAdmin();
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new AppError("A category with this title already exists.");
    const newCategory = await prisma.recipeCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createRecipeCategory:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const createRecipe = async (dto: ICreateRecipeDto): Promise<IRecipe> => {
  try {
    await requireAdmin();
    const { title, description, notes, items, recipeCategoryId, inStock } = dto;
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id: recipeCategoryId },
    });
    if (!existingCategory)
      throw new AppError(`A category #${recipeCategoryId} not found`);

    const existingRecipe = await prisma.recipe.findFirst({
      where: { title },
    });
    if (existingRecipe)
      throw new AppError("A recipe with this title already exists.");

    const newRecipe = await prisma.recipe.create({
      data: {
        description,
        notes,
        title,
        recipeCategoryId,
        inStock,
        ingredients: {
          create: items.map((item) => ({
            amount: item.amount,
            ingredientId: item.ingredientId,
          })),
        },
      },
      ...recipeArgs,
    });
    return newRecipe;
  } catch (e) {
    console.error("Database error in createRecipe:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const updateRecipeFields = async (
  id: number,
  dto: IRecipeDto,
): Promise<IRecipe> => {
  try {
    await requireAdmin();
    const existingRecipe = await prisma.recipe.findUnique({
      where: { title: dto.title },
    });
    if (existingRecipe)
      throw new AppError("A recipe with this title already exists.");

    return prisma.recipe.update({
      where: {
        id,
      },
      data: dto,
      ...recipeArgs,
    });
  } catch (e) {
    console.error("Database error in updateRecipeFields:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const updateRecipeIngredients = async (
  recipeId: number,
  items: IRecipeIngredient[],
): Promise<IRecipe> => {
  try {
    await requireAdmin();
    if (!Array.isArray(items)) {
      throw new AppError("Invalid items payload");
    }

    return prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({
        where: { id: recipeId },
        select: { id: true },
      });

      if (!recipe) throw new AppError("Recipe not found");

      if (items.some((i) => !i.ingredientId || !i.amount)) {
        throw new AppError("Invalid ingredient data");
      }

      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      if (items.length > 0) {
        await tx.recipeIngredient.createMany({
          data: items.map((i) => ({
            recipeId,
            ingredientId: i.ingredientId,
            amount: i.amount,
          })),
        });
      }

      const updated = await tx.recipe.findUnique({
        where: { id: recipeId },
        ...recipeArgs,
      });

      if (!updated) throw new AppError("Recipe not found after update");

      return updated;
    });
  } catch (e) {
    console.error("Database error in updateRecipeIngredients:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const deleteRecipe = async (recipeId: number): Promise<void> => {
  try {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) {
      throw new AppError("Recipe not found");
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });
  } catch (e) {
    console.error("Database error in deleteRecipe:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};

export const toggleSavedRecipe = async (
  id: number,
  isSaved: boolean,
): Promise<IRecipe> => {
  try {
    await requireAdmin();
    return prisma.recipe.update({
      where: { id },
      data: { isSaved },
      ...recipeArgs,
    });
  } catch (e) {
    console.error("Database error in toggleSavedRecipe:", e);
    if (e instanceof AppError) {
      throw e;
    }

    throw new Error("Something went wrong");
  }
};
