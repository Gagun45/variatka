import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeIngredient } from "@/lib/types";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

type TVariables = {
  id: number;
  dto: IRecipeDto;
  items?: IRecipeIngredient[];
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation<IRecipe, Error, TVariables>({
    mutationFn: ({ id, dto, items }) => recipeService.update(id, dto, items),
    onSuccess: (updatedRecipe, { items }) => {
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((recipe) =>
          recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
        ),
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      if (items !== undefined) {
        queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      }
      toast.success("Recipe edited successfully!");
    },
    onError: (error) => toast.error(error.message),
  });
};
