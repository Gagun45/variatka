import { useQuery } from "@tanstack/react-query";

import { ingredientKeys } from "../ingredient.keys";
import { ingredientService } from "../ingredient.api";

export const useIngredients = () => {
  return useQuery({
    queryKey: ingredientKeys.ingredients,
    queryFn: ingredientService.get,
  });
};
