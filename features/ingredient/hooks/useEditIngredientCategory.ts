import { IIngredientCategory } from "@/lib/prisma.args";
import { ICreateIngredientCategoryDto } from "@/zod/ingredient.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useEditIngredientCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IIngredientCategory,
    Error,
    { id: number; dto: ICreateIngredientCategoryDto }
  >({
    mutationFn: ({ dto, id }) => ingredientService.editCategory(id, dto),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.categories });
      toast.success("Category edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
