import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { recipeArgs } from "@/lib/prisma.args";
import { recipePresenter } from "@/lib/recipe.presenter";

export const getPublicRecipeById = cache(async (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      isConfirmed: true,
      isHidden: false,
    },
    ...recipeArgs,
  });

  return recipe ? recipePresenter.toPublic(recipe) : null;
});
