import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { toast } from "sonner";

export const useDeleteRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: recipeService.delete,

    onSuccess: () => {
      toast.success("Recipe deleted!");
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
