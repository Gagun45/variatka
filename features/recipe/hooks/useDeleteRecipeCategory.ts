import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useDeleteRecipeCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: recipeService.deleteCategory,

    onSuccess: () => {
      toast.success("Category deleted!");
      qclient.invalidateQueries({ queryKey: recipeKeys.categories });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
