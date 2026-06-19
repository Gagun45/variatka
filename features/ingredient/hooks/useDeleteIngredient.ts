import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useDeleteIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: ingredientService.delete,

    onSuccess: () => {
      toast.success("Ingredient deleted!");
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
