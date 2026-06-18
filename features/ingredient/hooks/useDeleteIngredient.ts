import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { toast } from "sonner";

export const useDeleteIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, number>({
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
