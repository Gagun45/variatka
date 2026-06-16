import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ingredientKeys } from "../ingredient.keys";
import { ingredientService } from "../ingredient.api";
import { IIngredient } from "@/lib/prisma.args";

export const useIngredient = (id: number) => {
  const qclient = useQueryClient();
  return useQuery({
    queryKey: ingredientKeys.ingredient(id),
    queryFn: () => ingredientService.getOne(id),
    initialData: () => {
      const cachedIngredients = qclient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      return cachedIngredients?.find((i) => i.id === id);
    },
  });
};
