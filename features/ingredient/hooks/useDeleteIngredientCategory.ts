import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useDeleteIngredientCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: ingredientService.deleteCategory,

    onSuccess: () => {
      toast.success("Category deleted!");
      qclient.invalidateQueries({ queryKey: ingredientKeys.categories });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
