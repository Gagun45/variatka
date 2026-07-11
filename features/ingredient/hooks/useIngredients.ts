import { useQuery } from "@tanstack/react-query";

import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useIngredients = () =>
  useQuery({
    queryKey: ingredientKeys.ingredients,
    queryFn: ingredientService.get,
  });
