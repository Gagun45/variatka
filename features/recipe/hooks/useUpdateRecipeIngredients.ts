import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipeIngredient } from "@/lib/types";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useUpdateRecipeIngredients = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IRecipe,
    Error,
    { recipeId: number; items: IRecipeIngredient[] }
  >({
    mutationFn: ({ recipeId, items }) =>
      recipeService.updateIngredients(recipeId, items),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
  });
  return mutation;
};
