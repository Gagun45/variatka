import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useRecipes = () => {
  return useQuery({
    queryKey: recipeKeys.recipes,
    queryFn: recipeService.get,
  });
};
