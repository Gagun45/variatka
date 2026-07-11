import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";

type TVariables = {
  isInStock: boolean;
  ingredientId: number;
};

type TContext = {
  prevIngredients?: IIngredient[];
  prevRecipes?: IRecipe[];
};

export const useToggleIngredientStock = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isInStock, ingredientId }) =>
      ingredientService.toggleStock(ingredientId, !isInStock),
    onMutate: async ({ ingredientId, isInStock }) => {
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
            ing.id === ingredientId ? { ...ing, isInStock: !isInStock } : ing,
          ),
      );
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((recipe) => ({
          ...recipe,
          ingredients: recipe.ingredients.map((ing) =>
            ing.ingredientId === ingredientId
              ? {
                  ...ing,
                  ingredient: { ...ing.ingredient, isInStock: !isInStock },
                }
              : ing,
          ),
        })),
      );
      return { prevIngredients, prevRecipes };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onSuccess: ({ title, isInStock }) => {
      toast.success(title, {
        description: `Stock changed to: ${isInStock ? "IN" : "OUT"}`,
      });
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
