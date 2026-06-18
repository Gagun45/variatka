import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredient } from "@/lib/prisma.args";
import { toast } from "sonner";

export const useRemoveIngredientImage = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, number>({
    mutationFn: ingredientService.removeImage,

    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      toast.success("Image removed!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
