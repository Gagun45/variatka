import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ICreateRecipeDto } from "@/lib/types";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useCreateRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, ICreateRecipeDto>({
    mutationFn: recipeService.create,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
  });
  return mutation;
};
