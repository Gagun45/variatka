import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useRecipe = (id: number) => {
  return useQuery({
    queryKey: recipeKeys.recipe(id),
    queryFn: () => recipeService.getRecipe(id),
  });
};
