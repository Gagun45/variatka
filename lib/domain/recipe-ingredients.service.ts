import { AppError } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { IRecipe, recipeArgs } from "@/lib/prisma.args";
import { IRecipeIngredient } from "@/lib/types";

const normalizeRecipeIngredients = (
  items: IRecipeIngredient[],
): IRecipeIngredient[] => {
  if (!Array.isArray(items)) throw new AppError("Invalid items payload");

  const seen = new Set<number>();

  return items.map((item) => {
    const ingredientId = Number(item.ingredientId);
    const amount = item.amount.trim();

    if (!Number.isInteger(ingredientId) || ingredientId <= 0 || !amount) {
      throw new AppError("Invalid ingredient data");
    }

    if (seen.has(ingredientId)) {
      throw new AppError("Recipe contains duplicate ingredients");
    }

    seen.add(ingredientId);

    return {
      ingredientId,
      amount,
    };
  });
};

export const recipeIngredientsService = {
  replace: async (
    recipeId: number,
    items: IRecipeIngredient[],
  ): Promise<IRecipe> => {
    const normalizedItems = normalizeRecipeIngredients(items);

    return prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({
        where: { id: recipeId },
        select: { id: true },
      });

      if (!recipe) throw new AppError("Recipe not found");

      if (normalizedItems.length > 0) {
        const ingredients = await tx.ingredient.findMany({
          where: {
            id: {
              in: normalizedItems.map((item) => item.ingredientId),
            },
          },
          select: { id: true },
        });

        if (ingredients.length !== normalizedItems.length) {
          throw new AppError("Some ingredients were not found");
        }
      }

      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      if (normalizedItems.length > 0) {
        await tx.recipeIngredient.createMany({
          data: normalizedItems.map((item) => ({
            recipeId,
            ingredientId: item.ingredientId,
            amount: item.amount,
          })),
        });
      }

      const updated = await tx.recipe.findUnique({
        where: { id: recipeId },
        ...recipeArgs,
      });

      if (!updated) throw new Error("Recipe not found after update");

      return updated;
    });
  },
};
