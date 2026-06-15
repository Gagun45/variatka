import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useRecipesByIngredientId = (id: number) => {
  return useQuery({
    queryKey: recipeKeys.recipesByIngredientId(id),
    queryFn: () => recipeService.getRecipesByIngredientId(id),
  });
};
