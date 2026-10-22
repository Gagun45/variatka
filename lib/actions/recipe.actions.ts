"use server";

import { IRecipeDto } from "@/zod/recipe.schema";
import { AppError } from "../error";
import { recipeIngredientsService } from "../domain/recipe-ingredients.service";
import { prisma } from "../prisma";
import {
  IRecipe,
  publicRecipeWhere,
  recipeArgs,
} from "../prisma.args";
import { recipePresenter } from "../recipe.presenter";
import { storageHelper } from "../r2/storage.helper";
import {
  IActionResponse,
  ICreateRecipeDto,
  IPublicRecipe,
  IRecipeIngredient,
} from "../types";
import { safeAction } from "./action.wrapper";
import { recipeWrites } from "../domain/recipe-write.service";
import { getCurrentUser, requireAdmin } from "./user.actions";

export const getRecipes = async (): Promise<IActionResponse<IRecipe[]>> => {
  return safeAction("getRecipes", async () => {
    const recipes = await prisma.recipe.findMany(recipeArgs);
    return recipes;
  });
};

export const getRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("getRecipe", async () => {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      ...recipeArgs,
    });
    if (!recipe) throw new AppError("Recipe not found");
    return recipe;
  });
};

export const getRecipeTitle = async (
  id: number,
): Promise<IActionResponse<string>> => {
  return safeAction("getRecipeTitle", async () => {
    await requireAdmin();

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Recipe not found");
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!recipe) throw new AppError("Recipe not found");
    return recipe.title;
  });
};

export const createRecipe = async (
  dto: ICreateRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("createRecipe", async () => {
    await requireAdmin();
    const { items, ...data } = dto;
    return recipeWrites.create({ ...data, isSaved: false, confirmationNotes: data.confirmationNotes ?? null }, items);
  });
};

export const updateRecipeFields = async (
  id: number,
  dto: IRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("updateRecipeFields", async () => {
    await requireAdmin();
    return recipeWrites.update(id, dto);
  });
};

export const updateRecipeIngredients = async (
  recipeId: number,
  items: IRecipeIngredient[],
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("updateRecipeIngredients", async () => {
    await requireAdmin();
    return recipeIngredientsService.replace(recipeId, items);
  });
};

export const updateRecipe = async (
  id: number,
  dto: IRecipeDto,
  items?: IRecipeIngredient[],
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("updateRecipe", async () => {
    await requireAdmin();

    return recipeWrites.update(id, dto, items);
  });
};

export const deleteRecipe = async (
  recipeId: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteRecipe", async () => {
    await requireAdmin();
    return recipeWrites.delete(recipeId);
  });
};

export const toggleSavedRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("toggleSavedRecipe", async () => {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { isSaved: true },
    });
    if (!recipe) throw new AppError("Recipe not found");
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { isSaved: !recipe.isSaved },
      ...recipeArgs,
    });
    return updatedRecipe;
  });
};

export const toggleConfirmedRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("toggleConfirmedRecipe", async () => {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { isConfirmed: true },
    });
    if (!recipe) throw new AppError("Recipe not found");
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { isConfirmed: !recipe.isConfirmed },
      ...recipeArgs,
    });
    return updatedRecipe;
  });
};

export const toggleHiddenRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("toggleHiddenRecipe", async () => {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { isHidden: true },
    });
    if (!recipe) throw new AppError("Recipe not found");
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { isHidden: !recipe.isHidden },
      ...recipeArgs,
    });
    return updatedRecipe;
  });
};

export const uploadRecipeImage = async (
  recipeId: number,
  file: File,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("uploadRecipeImage", async () => {
    await requireAdmin();
    const imageKey = await storageHelper.image({
      entity: "recipes",
      file,
      id: recipeId,
    });
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        imageKey,
        imageVersion: { increment: 1 },
      },
      ...recipeArgs,
    });
    return updatedRecipe;
  });
};

export const removeRecipeImage = async (
  recipeId: number,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("removeRecipeImage", async () => {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { imageKey: true },
    });
    if (!recipe) throw new AppError("Recipe not found");
    if (recipe.imageKey) await storageHelper.delete(recipe.imageKey);
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        imageKey: null,
        imageVersion: { increment: 1 },
      },
      ...recipeArgs,
    });
    return updatedRecipe;
  });
};

export const getPublicRecipes = async (): Promise<
  IActionResponse<IPublicRecipe[]>
> => {
  return safeAction("getPublicRecipes", async () => {
    const recipes = await prisma.recipe.findMany({
      where: publicRecipeWhere,
      ...recipeArgs,
    });
    const publicRecipes: IPublicRecipe[] = recipes.map(
      recipePresenter.toPublic,
    );

    return publicRecipes;
  });
};

export const getPublicRecipe = async (
  id: number,
): Promise<IActionResponse<IPublicRecipe>> => {
  return safeAction("getPublicRecipe", async () => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Recipe not found");
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        ...publicRecipeWhere,
      },
      ...recipeArgs,
    });

    if (!recipe) throw new AppError("Recipe not found");
    return recipePresenter.toPublic(recipe);
  });
};

export const getPublicRecipeMetadata = async (
  id: number,
): Promise<
  IActionResponse<Pick<IPublicRecipe, "title" | "description">>
> => {
  return safeAction("getPublicRecipeMetadata", async () => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Recipe not found");
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        ...publicRecipeWhere,
      },
      select: {
        title: true,
        description: true,
      },
    });

    if (!recipe) throw new AppError("Recipe not found");
    return recipe;
  });
};

export const getWishlistIds = async (): Promise<IActionResponse<number[]>> => {
  return safeAction("getWishlistIds", async () => {
    const user = await getCurrentUser();
    const items = await prisma.withlistItem.findMany({
      where: {
        userId: user.pid,
        recipe: publicRecipeWhere,
      },
      select: { recipeId: true },
    });
    return items.map(({ recipeId }) => recipeId);
  });
};

export const toggleWishlist = async (
  recipeId: number,
): Promise<IActionResponse<boolean>> => {
  return safeAction("toggleWishlist", async () => {
    const user = await getCurrentUser();
    const existing = await prisma.withlistItem.findUnique({
      where: {
        userId_recipeId: {
          userId: user.pid,
          recipeId,
        },
      },
    });
    if (existing) {
      await prisma.withlistItem.delete({
        where: {
          userId_recipeId: {
            userId: user.pid,
            recipeId,
          },
        },
      });
      return false;
    }
    await prisma.withlistItem.create({
      data: {
        userId: user.pid,
        recipeId,
      },
    });
    return true;
  });
};

