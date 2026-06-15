"use server";

import {
  ICreateIngredientCategoryDto,
  ICreateIngredientFormValues,
} from "@/zod/ingredient.schema";
import { prisma } from "../prisma";
import { IIngredient, IIngredientCategory } from "../prisma.args";

export const getIngredients = async (): Promise<IIngredient[]> => {
  const ingredients = await prisma.ingredient.findMany();
  return ingredients;
};

export const getIngredientCategories = async (): Promise<
  IIngredientCategory[]
> => {
  const categories = await prisma.ingredientCategory.findMany();
  return categories;
};

export const createIngredientCategory = async (
  dto: ICreateIngredientCategoryDto,
) => {
  try {
    const existingCategory = await prisma.ingredientCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      throw new Error("A category with this title already exists.");
    const newCategory = await prisma.ingredientCategory.create({ data: dto });

    return newCategory;
  } catch (e) {
    console.error("Database error in createIngredientCategory:", e);
    throw new Error("Something went wrong");
  }
};

export const createIngredient = async (
  dto: ICreateIngredientFormValues,
): Promise<IIngredient> => {
  const { categoryId, title } = dto;
  try {
    const existingCategory = await prisma.ingredientCategory.findUnique({
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

export const getIngredient = async (id: number): Promise<IIngredient> => {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient) throw new Error("Ingredient not found");

    return ingredient;
  } catch (e) {
    console.error("Database error in getIngredient:", e);
    throw new Error("Something went wrong");
  }
};

export const updateIngredient = async (
  id: number,
  dto: ICreateIngredientFormValues,
): Promise<IIngredient> => {
  try {
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: dto,
    });
    return updatedIngredient;
  } catch (e) {
    console.error("Database error in updateIngredient:", e);
    throw new Error("Something went wrong");
  }
};
