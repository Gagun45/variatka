import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipeIngredient } from "@/lib/types";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { toast } from "sonner";

export const useUpdateRecipeIngredients = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    IRecipe,
    Error,
    { recipeId: number; items: IRecipeIngredient[] }
  >({
    mutationFn: ({ recipeId, items }) =>
      recipeService.updateIngredients(recipeId, items),
    onSuccess: (updatedRecipe) => {
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((recipe) =>
          recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
        ),
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      toast.success("Recipe edited!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
