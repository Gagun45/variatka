import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useDeleteRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<void, Error, number>({
    mutationFn: recipeService.delete,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
  });
  return mutation;
};
