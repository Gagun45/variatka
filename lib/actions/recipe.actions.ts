"use server";

import { IRecipeDto } from "@/zod/recipe.schema";
import { AppError } from "../error";
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
import { ACTION_ERROR } from "./action.unwrapper";
import { getCurrentUser, requireAdmin } from "./user.actions";

export const getRecipes = async (): Promise<IActionResponse<IRecipe[]>> => {
  try {
    const recipes = await prisma.recipe.findMany(recipeArgs);

    return {
      ok: true,
      data: recipes,
    };
  } catch (e) {
    console.error("Error in getRecipes:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      ...recipeArgs,
    });
    if (!recipe) throw new AppError("Recipe not found");
    return {
      ok: true,
      data: recipe,
    };
  } catch (e) {
    console.error("Error in getRecipe", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const createRecipe = async (
  dto: ICreateRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: newRecipe,
    };
  } catch (e) {
    console.error("Error in createRecipe:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const updateRecipeFields = async (
  id: number,
  dto: IRecipeDto,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in updateRecipeFields:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const updateRecipeIngredients = async (
  recipeId: number,
  items: IRecipeIngredient[],
): Promise<IActionResponse<IRecipe>> => {
  try {
    await requireAdmin();
    if (!Array.isArray(items)) throw new AppError("Invalid items payload");

    const response = await prisma.$transaction(
      async (tx): Promise<IActionResponse<IRecipe>> => {
        const recipe = await tx.recipe.findUnique({
          where: { id: recipeId },
          select: { id: true },
        });

        if (!recipe) throw new AppError("Recipe not found");

        if (items.some((i) => !i.ingredientId || !i.amount))
          throw new AppError("Invalid ingredient data");

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

        if (!updated) throw new Error("Not found after update");

        return {
          data: updated,
          ok: true,
        };
      },
    );
    return response;
  } catch (e) {
    console.error("Error in updateRecipeIngredients:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const deleteRecipe = async (
  recipeId: number,
): Promise<IActionResponse<number>> => {
  try {
    await requireAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe) throw new AppError("Recipe not found");

    await prisma.recipe.delete({
      where: { id: recipeId },
    });
    return {
      data: recipeId,
      ok: true,
    };
  } catch (e) {
    console.error("Database error in deleteRecipe:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleSavedRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in toggleSavedRecipe:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleConfirmedRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in toggleConfirmedRecipe:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleHiddenRecipe = async (
  id: number,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in toggleHiddenRecipe:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const uploadRecipeImage = async (
  recipeId: number,
  file: File,
): Promise<IActionResponse<IRecipe>> => {
  try {
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
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in uploadRecipeImage:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const removeRecipeImage = async (
  recipeId: number,
): Promise<IActionResponse<IRecipe>> => {
  try {
    await requireAdmin();
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        imageKey: null,
        imageVersion: { increment: 1 },
      },
      ...recipeArgs,
    });
    return {
      ok: true,
      data: updatedRecipe,
    };
  } catch (e) {
    console.error("Error in removeRecipeImage:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getPublicRecipes = async (): Promise<
  IActionResponse<IPublicRecipe[]>
> => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { isConfirmed: true },
      ...recipeArgs,
    });
    const publicRecipes: IPublicRecipe[] = recipes.map(
      recipePresenter.toPublic,
    );

    return {
      ok: true,
      data: publicRecipes,
    };
  } catch (e) {
    console.error("Error in getPublicRecipes:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getWishlist = async (): Promise<
  IActionResponse<IPublicRecipe[]>
> => {
  try {
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
    return {
      ok: true,
      data: publicRecipes,
    };
  } catch (e) {
    console.error("Error in getWishlist:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const toggleWishlist = async (
  recipeId: number,
): Promise<IActionResponse<boolean>> => {
  try {
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
      return { ok: true, data: false };
    }
    await prisma.withlistItem.create({
      data: {
        userId: user.pid,
        recipeId,
      },
    });
    return {
      ok: true,
      data: true,
    };
  } catch (e) {
    console.error("Error in toggleWishlist:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const getAdminWishlists = async (): Promise<
  IActionResponse<IUserWithWishlist[]>
> => {
  try {
    const wishlistItems = await prisma.user.findMany({
      where: {
        withlistItems: {
          some: {},
        },
      },
      ...userWithWishlistArgs,
    });
    return {
      ok: true,
      data: wishlistItems,
    };
  } catch (e) {
    console.error("Error in getAdminWishlists:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};
