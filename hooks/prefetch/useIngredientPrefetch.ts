"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { ingredientService } from "@/features/ingredient/ingredient.api";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { recipeService } from "@/features/recipe/recipe.api";

export const useIngredientPagePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchIngredientPage = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ingredientKeys.ingredient(id),
      queryFn: () => ingredientService.getOne(id),
    });
    queryClient.prefetchQuery({
      queryKey: recipeKeys.recipesByIngredientId(id),
      queryFn: () => recipeService.getRecipesByIngredientId(id),
    });
  };

  return { prefetchIngredientPage };
};
