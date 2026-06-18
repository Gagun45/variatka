import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { toast } from "sonner";

type TVariables = {
  isInStock: boolean;
  ingredientId: number;
};

type TContext = {
  prevIngredients?: IIngredient[];
};

export const useToggleIngredientStock = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ isInStock, ingredientId }) =>
      ingredientService.toggleStock(ingredientId, !isInStock),
    onMutate: async ({ ingredientId, isInStock }) => {
      await qclient.cancelQueries({ queryKey: ingredientKeys.ingredients });
      const prevIngredients = qclient.getQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
      );
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ing) =>
            ing.id === ingredientId ? { ...ing, isInStock: !isInStock } : ing,
          ),
      );
      return { prevIngredients };
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
    },
  });
  return mutation;
};
