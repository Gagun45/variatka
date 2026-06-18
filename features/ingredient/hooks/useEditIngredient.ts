import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { toast } from "sonner";

export const useEditIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IIngredient,
    Error,
    { id: number; dto: IIngredientFormValues }
  >({
    mutationFn: ({ dto, id }) => ingredientService.edit(id, dto),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      toast.success("Ingredient edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
