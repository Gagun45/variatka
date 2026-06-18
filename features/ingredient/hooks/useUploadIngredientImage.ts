import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredient } from "@/lib/prisma.args";
import { toast } from "sonner";

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
      toast.success("Upload success!");
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
    },

    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
