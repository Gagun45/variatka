"use server";

import { ICreateRecipeCategoryDto, IRecipeDto } from "@/zod/recipe.schema";
import { userIsAdmin } from "../auth";
import { AppError } from "../error";
import { prisma } from "../prisma";
import { IRecipe, IRecipeCategory, recipeArgs } from "../prisma.args";
import { uploadHelper } from "../s3/upload.helper";
import {
  IActionResponse,
  ICreateRecipeDto,
  IPublicRecipe,
  IRecipeIngredient,
} from "../types";
import { ACTION_ERROR } from "./action.unwrapper";
import { Prisma } from "@prisma/client";

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
      throw new AppError("A category with this title already exists.");

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
    const {
      title,
      description,
      notes,
      items,
      confirmationNotes,
      isConfirmed,
      recipeCategoryId,
      inStock,
    } = dto;
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id: recipeCategoryId },
    });
    if (!existingCategory) throw new AppError("Category not found");

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
        recipeCategoryId,
        inStock,
        confirmationNotes,
        isConfirmed,
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
    await userIsAdmin();
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
    await userIsAdmin();
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

export const toggleConfirmedRecipe = async (
  id: number,
  isConfirmed: boolean,
): Promise<IActionResponse<IRecipe>> => {
  try {
    await userIsAdmin();
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { isConfirmed },
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

export const editRecipeCategory = async (
  id: number,
  dto: ICreateRecipeCategoryDto,
): Promise<IActionResponse<IRecipeCategory>> => {
  try {
    await userIsAdmin();

    const updatedCategory = await prisma.recipeCategory.update({
      where: { id },
      data: dto,
    });
    return {
      ok: true,
      data: updatedCategory,
    };
  } catch (e) {
    console.error("Error in editRecipeCategory:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ACTION_ERROR("Category not found");
      }
      if (e.code === "P2002") {
        return ACTION_ERROR("Category with the same title already exists");
      }
    }
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const deleteRecipeCategory = async (
  id: number,
): Promise<IActionResponse<number>> => {
  try {
    await userIsAdmin();
    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            recipes: true,
          },
        },
      },
    });
    if (!existingCategory) throw new AppError("Category not found");
    const totalItems = existingCategory._count.recipes;
    if (totalItems > 0)
      throw new AppError(
        `Cannot delete category because it contains ${totalItems} recipes`,
      );
    await prisma.recipeCategory.delete({
      where: { id },
    });
    return {
      ok: true,
      data: id,
    };
  } catch (e) {
    console.error("Error in deleteRecipeCategory:", e);
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
    const publicRecipes: IPublicRecipe[] = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageKey: r.imageKey,
      recipeCategory: {
        id: r.recipeCategory.id,
        title: r.recipeCategory.title,
      },
      ingredients: r.ingredients.map((ri) => ({
        id: ri.ingredientId,
        title: ri.ingredient.title,
      })),
    }));

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
