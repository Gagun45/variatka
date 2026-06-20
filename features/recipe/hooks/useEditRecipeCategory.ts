import { IRecipeCategory } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useEditRecipeCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IRecipeCategory,
    Error,
    { id: number; dto: ICreateRecipeCategoryDto }
  >({
    mutationFn: ({ dto, id }) => recipeService.editCategory(id, dto),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.categories });
      toast.success("Category edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
