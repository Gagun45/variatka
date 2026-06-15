"use server";

import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";
import { prisma } from "../prisma";
import { IRecipe, IRecipeCategory, recipeArgs } from "../prisma.args";
import { ICreateRecipeDto } from "../types";

export const getRecipeCategories = async (): Promise<IRecipeCategory[]> => {
  const categories = await prisma.recipeCategory.findMany();
  return categories;
};

export const getRecipes = async (): Promise<IRecipe[]> => {
  const recipes = await prisma.recipe.findMany(recipeArgs);
  return recipes;
};

export const createRecipeCategory = async (dto: ICreateRecipeCategoryDto) => {
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
  const { title, description, notes, items, categoryId } = dto;
  try {
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory)
      throw new Error(`A category #${categoryId} not found`);

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
        recipeCategoryId: categoryId,
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
