import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ICreateRecipeDto } from "@/lib/types";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { toast } from "sonner";

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, ICreateRecipeDto>({
    mutationFn: recipeService.create,
    onSuccess: (newRecipe) => {
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) => [
        newRecipe,
        ...old,
      ]);
      queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      toast.success("Recipe created!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
