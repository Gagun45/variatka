"use server";

import { IRecipeDto } from "@/zod/recipe.schema";
import { AppError } from "../error";
import { recipeIngredientsService } from "../domain/recipe-ingredients.service";
import { prisma } from "../prisma";
import {
  IRecipe,
  IUserWithWishlist,
  recipeArgs,
  userWithWishlistArgs,
} from "../prisma.args";
import { recipePresenter } from "../recipe.presenter";
import { uploadHelper } from "../s3/upload.helper";
import {
  IActionResponse,
  ICreateRecipeDto,
  IPublicRecipe,
  IRecipeIngredient,
} from "../types";
import { safeAction } from "./action.wrapper";
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

export const createRecipe = async (
  dto: ICreateRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("createRecipe", async () => {
    await requireAdmin();
    const {
      title,
      description,
      notes,
      items,
      confirmationNotes,
      isConfirmed,
      category,
      inStock,
      isHidden,
      series,
      spicy,
    } = dto;

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
        category,
        inStock,
        confirmationNotes,
        isConfirmed,
        isHidden,
        series,
        spicy,
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
  });
};

export const updateRecipeFields = async (
  id: number,
  dto: IRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("updateRecipeFields", async () => {
    await requireAdmin();
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id,
        },
      },
    });
    if (existingRecipe)
      throw new AppError("A recipe with this title already exists.");

    const updatedRecipe = await prisma.recipe.update({
      where: {
        id,
      },
      data: dto,
      ...recipeArgs,
    });
    return updatedRecipe;
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
  items: IRecipeIngredient[],
): Promise<IActionResponse<IRecipe>> => {
  return safeAction("updateRecipe", async () => {
    await requireAdmin();

    return prisma.$transaction(async (tx) => {
      const existingRecipe = await tx.recipe.findFirst({
        where: { title: dto.title, NOT: { id } },
        select: { id: true },
      });

      if (existingRecipe) {
        throw new AppError("A recipe with this title already exists.");
      }

      await tx.recipe.update({ where: { id }, data: dto });
      await recipeIngredientsService.replaceInTransaction(tx, id, items);

      const updatedRecipe = await tx.recipe.findUnique({
        where: { id },
        ...recipeArgs,
      });

      if (!updatedRecipe) throw new AppError("Recipe not found after update");
      return updatedRecipe;
    });
  });
};

export const deleteRecipe = async (
  recipeId: number,
): Promise<IActionResponse<number>> => {
  return safeAction("deleteRecipe", async () => {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) throw new AppError("Recipe not found");

    await prisma.recipe.delete({
      where: { id: recipeId },
    });
    return recipeId;
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
    const imageKey = await uploadHelper.image({
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
      where: { isConfirmed: true },
      ...recipeArgs,
    });
    const publicRecipes: IPublicRecipe[] = recipes.map(
      recipePresenter.toPublic,
    );

    return publicRecipes;
  });
};

export const getWishlist = async (): Promise<
  IActionResponse<IPublicRecipe[]>
> => {
  return safeAction("getWishlist", async () => {
    const user = await getCurrentUser();
    const recipes: IRecipe[] = await prisma.recipe.findMany({
      where: {
        withlistItems: {
          some: {
            userId: user.pid,
          },
        },
      },
      ...recipeArgs,
    });
    const publicRecipes = recipes.map(recipePresenter.toPublic);
    return publicRecipes;
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

export const getAdminWishlists = async (): Promise<
  IActionResponse<IUserWithWishlist[]>
> => {
  return safeAction("getAdminWishlists", async () => {
    const wishlistItems = await prisma.user.findMany({
      where: {
        withlistItems: {
          some: {},
        },
      },
      ...userWithWishlistArgs,
    });
    return wishlistItems;
  });
};
