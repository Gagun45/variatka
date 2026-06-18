import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

type TVariables = {
  isSaved: boolean;
  ingredientId: number;
};

type TContext = {
  prevIngredients?: IIngredient[];
};

export const useToggleSavedIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isSaved, ingredientId }) =>
      ingredientService.toggle(ingredientId, !isSaved),
    onMutate: async ({ ingredientId, isSaved }) => {
      await qclient.cancelQueries({ queryKey: ingredientKeys.ingredients });
      const prevIngredients = qclient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ing) =>
            ing.id === ingredientId ? { ...ing, isSaved: !isSaved } : ing,
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
