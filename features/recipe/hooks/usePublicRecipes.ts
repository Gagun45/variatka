import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const usePublicRecipes = () => {
  return useQuery({
    queryKey: recipeKeys.public,
    queryFn: recipeService.getPublicRecipes,
  });
};
