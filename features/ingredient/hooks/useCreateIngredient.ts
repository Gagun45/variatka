import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredient } from "@/lib/prisma.args";
import { toast } from "sonner";

export const useCreateIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, IIngredientFormValues>({
    mutationFn: ingredientService.create,
    onSuccess: (newIngredient) => {
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) => [newIngredient, ...old],
      );
      toast.success("Ingredient created!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
