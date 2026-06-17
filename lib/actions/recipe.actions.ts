"use server";

import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";
import { prisma } from "../prisma";
import { IRecipe, IRecipeCategory, recipeArgs } from "../prisma.args";
import { ICreateRecipeDto, IRecipeIngredient } from "../types";
import { requireAdmin } from "../auth";

export const getRecipeCategories = async (): Promise<IRecipeCategory[]> => {
  const categories = await prisma.recipeCategory.findMany();
  return categories;
};

export const getRecipes = async (): Promise<IRecipe[]> => {
  const recipes = await prisma.recipe.findMany(recipeArgs);
  return recipes;
};

export const createRecipeCategory = async (dto: ICreateRecipeCategoryDto) => {
  await requireAdmin();
  try {
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new Error("A category with this title already exists.");
    const newCategory = await prisma.recipeCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createRecipeCategory:", e);
    throw new Error("Something went wrong");
  }
};

export const createRecipe = async (dto: ICreateRecipeDto): Promise<IRecipe> => {
  await requireAdmin();
  const { title, description, notes, items, recipeCategoryId } = dto;
  try {
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id: recipeCategoryId },
    });
    if (!existingCategory)
      throw new Error(`A category #${recipeCategoryId} not found`);

    const existingRecipe = await prisma.recipe.findFirst({
      where: { title },
    });
    if (existingRecipe)
      throw new Error("A recipe with this title already exists.");

    const newRecipe = await prisma.recipe.create({
      data: {
        description,
        notes,
        title,
        recipeCategoryId,
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
    throw new Error("Something went wrong");
  }
};

export const updateRecipeFields = async (
  id: number,
  dto: IRecipeDto,
): Promise<IRecipe> => {
  await requireAdmin();
  try {
    return prisma.recipe.update({
      where: {
        id,
      },
      data: dto,
      ...recipeArgs,
    });
  } catch (e) {
    console.error("Database error in updateRecipeFields:", e);
    throw new Error("Something went wrong");
  }
};

export const updateRecipeIngredients = async (
  recipeId: number,
  items: IRecipeIngredient[],
): Promise<IRecipe> => {
  await requireAdmin();
  if (!Array.isArray(items)) {
    throw new Error("Invalid items payload");
  }

  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) throw new Error("Recipe not found");

    if (items.some((i) => !i.ingredientId || !i.amount)) {
      throw new Error("Invalid ingredient data");
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

    if (!updated) throw new Error("Recipe not found after update");

    return updated;
  });
};

export const deleteRecipe = async (recipeId: number): Promise<void> => {
  await requireAdmin();
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  await prisma.recipe.delete({
    where: { id: recipeId },
  });
};
