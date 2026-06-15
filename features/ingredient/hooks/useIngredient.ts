import { useQuery } from "@tanstack/react-query";

import { ingredientKeys } from "../ingredient.keys";
import { ingredientService } from "../ingredient.api";

export const useIngredient = (id: number) => {
  return useQuery({
    queryKey: ingredientKeys.ingredient(id),
    queryFn: () => ingredientService.getOne(id),
  });
};
