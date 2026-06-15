import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredient } from "@/lib/prisma.args";

export const useCreateIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, ICreateIngredientFormValues>(
    {
      mutationFn: ingredientService.create,
      onSuccess: () => {
        qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      },
    },
  );
  return mutation;
};
