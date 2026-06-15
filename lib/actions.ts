"use server";

import { revalidatePath } from "next/cache";

import { IRecipeIngredientItem } from "@/prisma/store/recipe";
import { ICreateCategoryFormValues } from "@/zod/category.schema";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { ICreateRecipeFormValues } from "@/zod/recipe.schema";
import { prisma } from "./prisma";
import { ICategory, IIngredient, IRecipe, recipeArgs } from "./prisma.args";
import { IResponse } from "./types";

export const getCategories = async (): Promise<ICategory[]> => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const getIngredients = async (): Promise<IIngredient[]> => {
  const ingredients = await prisma.ingredient.findMany();
  return ingredients;
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
): Promise<IResponse> => {
  const { categoryId, title } = dto;
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory)
      return {
        success: false,
        message: `A category #${categoryId} not found`,
      };
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { title },
    });
    if (existingIngredient)
      return {
        success: false,
        message: "An ingredient with this title already exists.",
      };
    await prisma.ingredient.create({
      data: dto,
    });
    revalidatePath("/ingredients");
    return { success: true, message: "Ingredient created" };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const createRecipe = async (
  values: ICreateRecipeFormValues,
  items: IRecipeIngredientItem[],
): Promise<IResponse> => {
  const { title, description, notes } = values;
  try {
    const existingRecipe = await prisma.recipe.findFirst({
      where: { title },
    });
    if (existingRecipe)
      return {
        success: false,
        message: "A recipe with this title already exists.",
      };
    await prisma.recipe.create({
      data: {
        description,
        notes,
        title,
        ingredients: {
          create: items.map((item) => ({
            amount: item.amount,
            ingredientId: item.ingredient.id,
          })),
        },
      },
    });
    revalidatePath("/recipes");
    return { success: true, message: "Recipe created" };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const getRecipes = async (): Promise<IRecipe[]> => {
  const recipes = await prisma.recipe.findMany(recipeArgs);
  return recipes;
};
