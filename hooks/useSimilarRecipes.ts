import { useMemo } from "react";
import { IRecipe } from "@/lib/prisma.args";
import { getSimilarRecipes } from "@/lib/similar-recipes";

export const useSimilarRecipes = (
  currentRecipe: IRecipe | null,
  allRecipes: IRecipe[] | undefined,
) => {
  return useMemo(() => {
    if (!currentRecipe || !allRecipes) return [];

    return getSimilarRecipes(currentRecipe, allRecipes, 5);
  }, [currentRecipe, allRecipes]);
};
