"use server";

import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";
import { userIsAdmin } from "../auth";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IRecipe, IRecipeCategory, recipeArgs } from "../prisma.args";
import { uploadHelper } from "../s3/upload.helper";
import { IActionResponse, ICreateRecipeDto, IRecipeIngredient } from "../types";
import { ACTION_ERROR } from "./action.unwrapper";

export const getRecipeCategories = async (): Promise<
  IActionResponse<IRecipeCategory[]>
> => {
  try {
    const categories = await prisma.recipeCategory.findMany();
    return {
      ok: true,
      data: categories,
    };
  } catch (e) {
    console.error("Erro in getRecipeCategories:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

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

export const createRecipeCategory = async (
  dto: ICreateRecipeCategoryDto,
): Promise<IActionResponse<IRecipeCategory>> => {
  try {
    await userIsAdmin();
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { title: dto.title },
    });
    if (existingCategory)
      return {
        ok: false,
        message: "A category with this title already exists.",
      };

    const newCategory = await prisma.recipeCategory.create({ data: dto });

    return {
      ok: true,
      data: newCategory,
    };
  } catch (e) {
    console.error("Error in createRecipeCategory:", e);
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
    await userIsAdmin();
    const { title, description, notes, items, recipeCategoryId, inStock } = dto;
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id: recipeCategoryId },
    });
    if (!existingCategory)
      return {
        ok: false,
        message: `A category #${recipeCategoryId} not found`,
      };

    const existingRecipe = await prisma.recipe.findFirst({
      where: { title },
    });
    if (existingRecipe)
      return {
        ok: false,
        message: "A recipe with this title already exists.",
      };

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
    await userIsAdmin();
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        title: dto.title,
        NOT: {
          id,
        },
      },
    });
    if (existingRecipe)
      return {
        ok: false,
        message: "A recipe with this title already exists.",
      };

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
    await userIsAdmin();
    if (!Array.isArray(items))
      return {
        ok: false,
        message: "Invalid items payload",
      };

    const response = await prisma.$transaction(
      async (tx): Promise<IActionResponse<IRecipe>> => {
        const recipe = await tx.recipe.findUnique({
          where: { id: recipeId },
          select: { id: true },
        });

        if (!recipe)
          return {
            ok: false,
            message: "Recipe not found",
          };

        if (items.some((i) => !i.ingredientId || !i.amount))
          return {
            ok: false,
            message: "Invalid ingredient data",
          };

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

        if (!updated)
          return {
            ok: false,
            message: "Something went wrong",
          };

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
    await userIsAdmin();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    if (!recipe)
      return {
        ok: false,
        message: "Recipe not found",
      };

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
  isSaved: boolean,
): Promise<IActionResponse<IRecipe>> => {
  try {
    await userIsAdmin();
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { isSaved },
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

export const uploadRecipeImage = async (
  recipeId: number,
  file: File,
): Promise<IActionResponse<IRecipe>> => {
  try {
    await userIsAdmin();
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
    await userIsAdmin();
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
