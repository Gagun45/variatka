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

export const getIngredients = async (): Promise<IIngredient[]> => {
  const ingredients = await prisma.ingredient.findMany({
    ...ingredientArgs,
  });
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
  await requireAdmin();
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
  dto: IIngredientFormValues,
): Promise<IIngredient> => {
  await requireAdmin();
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
      ...ingredientArgs,
    });
    return newIngredient;
  } catch (e) {
    console.error("Database error in createIngredient:", e);
    throw new Error("Something went wrong");
  }
};

export const editIngredient = async (
  id: number,
  dto: IIngredientFormValues,
): Promise<IIngredient> => {
  await requireAdmin();
  try {
    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: dto,
      ...ingredientArgs,
    });
    return updatedIngredient;
  } catch (e) {
    console.error("Database error in updateIngredient:", e);
    throw new Error("Something went wrong");
  }
};

export const deleteIngredient = async (id: number) => {
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
  if (!ingredient) throw new Error("Ingredient not found");
  if (ingredient._count.recipeIngredients > 0)
    throw new Error("Cannot delete ingredients used in recipes");
  return prisma.ingredient.delete({
    where: { id },
    ...ingredientArgs,
  });
};

export const toggleMyIngredient = async (
  id: number,
  isAdded: boolean,
): Promise<IIngredient> => {
  await requireAdmin();
  return prisma.ingredient.update({
    where: { id },
    data: { isAdded },
    ...ingredientArgs,
  });
};

export const uploadIngredientImage = async (
  ingredientId: number,
  file: File,
): Promise<IIngredient> => {
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
};

export const removeIngredientImage = async (
  ingredientId: number,
): Promise<IIngredient> => {
  const updatedIngredient = await prisma.ingredient.update({
    where: { id: ingredientId },
    data: {
      imageKey: null,
      imageVersion: { increment: 1 },
    },
    ...ingredientArgs,
  });
  return updatedIngredient;
};
