import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredient } from "@/lib/prisma.args";

export const useUploadIngredientImage = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IIngredient,
    Error,
    { ingredientId: number; file: File }
  >({
    mutationFn: ({ file, ingredientId }) =>
      ingredientService.uploadImage(ingredientId, file),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },
  });
  return mutation;
};
