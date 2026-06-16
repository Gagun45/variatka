import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

type TVariables = {
  isAdded: boolean;
  ingredientId: number;
};

export const useToggleMyIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables>({
    mutationFn: ({ isAdded, ingredientId }) =>
      ingredientService.toggle(ingredientId, !isAdded),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
  });
  return mutation;
};
