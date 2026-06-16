import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipeDto } from "@/zod/recipe.schema";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useUpdateRecipeFields = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, { id: number; dto: IRecipeDto }>(
    {
      mutationFn: ({ dto, id }) => recipeService.updateFields(id, dto),
      onSuccess: (_, { id }) => {
        qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
        qclient.invalidateQueries({ queryKey: recipeKeys.recipe(id) });
      },
    },
  );
  return mutation;
};
