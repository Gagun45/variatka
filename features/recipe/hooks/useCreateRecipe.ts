import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ICreateRecipeDto } from "@/lib/types";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";

export const useCreateRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, ICreateRecipeDto>({
    mutationFn: recipeService.create,
    onSuccess: (_, { items }) => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      items.forEach((item) => {
        qclient.invalidateQueries({
          queryKey: recipeKeys.recipesByIngredientId(item.ingredientId),
        });
      });
    },
  });
  return mutation;
};
