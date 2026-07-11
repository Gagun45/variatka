import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { toast } from "sonner";

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: recipeService.delete,

    onSuccess: () => {
      toast.success("Recipe deleted!");
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
