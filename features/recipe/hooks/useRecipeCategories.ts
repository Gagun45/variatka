import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useRecipeCategories = () => {
  return useQuery({
    queryKey: recipeKeys.categories,
    queryFn: recipeService.getCategories,
  });
};
