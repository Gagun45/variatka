import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

type TVariables = {
  isAdded: boolean;
  ingredientId: number;
};

type TContext = {
  prevIngredients?: IIngredient[];
};

export const useToggleMyIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isAdded, ingredientId }) =>
      ingredientService.toggle(ingredientId, !isAdded),
    onMutate: async ({ ingredientId, isAdded }) => {
      await qclient.cancelQueries({ queryKey: ingredientKeys.ingredients });
      const prevIngredients = qclient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ing) =>
            ing.id === ingredientId ? { ...ing, isAdded: !isAdded } : ing,
          ),
      );
      return { prevIngredients };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevIngredients) {
        qclient.setQueryData(
          ingredientKeys.ingredients,
          context.prevIngredients,
        );
      }
    },
  });
  return mutation;
};
