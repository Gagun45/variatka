import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useDeleteIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, number>({
    mutationFn: ingredientService.delete,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
  });
  return mutation;
};
