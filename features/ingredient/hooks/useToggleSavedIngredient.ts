import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { toast } from "sonner";
import { recipeKeys } from "@/features/recipe/recipe.keys";

type TVariables = {
  isSaved: boolean;
  ingredientId: number;
};

type TContext = {
  prevIngredients?: IIngredient[];
  prevRecipes?: IRecipe[];
};

export const useToggleSavedIngredient = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isSaved, ingredientId }) =>
      ingredientService.toggleSaved(ingredientId, !isSaved),
    onMutate: async ({ ingredientId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ingredientKeys.ingredients });
      await queryClient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevIngredients = queryClient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      const prevRecipes = queryClient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      queryClient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ing) =>
            ing.id === ingredientId ? { ...ing, isSaved: !isSaved } : ing,
          ),
      );
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((recipe) => ({
          ...recipe,
          ingredients: recipe.ingredients.map((ri) =>
            ri.ingredientId === ingredientId
              ? {
                  ...ri,
                  ingredient: {
                    ...ri.ingredient,
                    isSaved: !isSaved,
                  },
                }
              : ri,
          ),
        })),
      );
      return { prevIngredients, prevRecipes };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onError: (e, _variables, context) => {
      toast.error(e.message);
      if (context?.prevIngredients) {
        queryClient.setQueryData(
          ingredientKeys.ingredients,
          context.prevIngredients,
        );
      }
      if (context?.prevRecipes) {
        queryClient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
