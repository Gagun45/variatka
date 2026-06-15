import { useQuery } from "@tanstack/react-query";
import { ingredientKeys } from "../ingredient.keys";
import { ingredientService } from "../ingredient.api";

export const useIngredientCategories = () => {
  return useQuery({
    queryKey: ingredientKeys.categories(),
    queryFn: ingredientService.getCategories,
  });
};
