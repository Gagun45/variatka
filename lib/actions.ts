"use server";

import { ICreateCategoryFormValues } from "@/zod/category.schema";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { prisma } from "./prisma";
import { ICategory, IIngredient, IRecipe, recipeArgs } from "./prisma.args";
import { ICreateRecipeDto } from "./types";

export const getCategories = async (): Promise<ICategory[]> => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const getIngredients = async (): Promise<IIngredient[]> => {
  const ingredients = await prisma.ingredient.findMany();
  return ingredients;
};

export const getRecipes = async (): Promise<IRecipe[]> => {
  const recipes = await prisma.recipe.findMany(recipeArgs);
  return recipes;
};

export const createCategory = async (
  dto: ICreateCategoryFormValues,
): Promise<ICategory> => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new Error("A category with this title already exists.");
    const newCategory = await prisma.category.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createCategory:", e);
    throw new Error("Something went wrong");
  }
};

export const createIngredient = async (
  dto: ICreateIngredientFormValues,
): Promise<IIngredient> => {
  const { categoryId, title } = dto;
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory)
      throw new Error(`A category #${categoryId} not found`);

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { title },
    });
    if (existingIngredient)
      throw new Error("An ingredient with this title already exists.");

    const newIngredient = await prisma.ingredient.create({
      data: dto,
    });
    return newIngredient;
  } catch (e) {
    console.error("Database error in createIngredient:", e);
    throw new Error("Something went wrong");
  }
};

export const createRecipe = async (dto: ICreateRecipeDto): Promise<IRecipe> => {
  const { title, description, notes, items } = dto;
  try {
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
