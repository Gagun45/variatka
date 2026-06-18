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
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isInStock, ingredientId }) =>
      ingredientService.toggleStock(ingredientId, !isInStock),
    onMutate: async ({ ingredientId, isInStock }) => {
      await qclient.cancelQueries({ queryKey: ingredientKeys.ingredients });
      await qclient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevIngredients = qclient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ing) =>
            ing.id === ingredientId ? { ...ing, isInStock: !isInStock } : ing,
          ),
      );
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
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
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onSuccess: ({ title, isInStock }) => {
      toast.success(title, {
        description: `Stock changed to: ${isInStock ? "IN" : "OUT"}`,
      });
    },
    onError: (e, _variables, context) => {
      toast.error(e.message);
      if (context?.prevIngredients) {
        qclient.setQueryData(
          ingredientKeys.ingredients,
          context.prevIngredients,
        );
      }
      if (context?.prevRecipes) {
        qclient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
