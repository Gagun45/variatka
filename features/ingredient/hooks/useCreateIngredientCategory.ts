import { IIngredientCategory } from "@/lib/prisma.args";
import { ICreateIngredientCategoryDto } from "@/zod/ingredient.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";

export const useCreateIngredientCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IIngredientCategory,
    Error,
    ICreateIngredientCategoryDto
  >({
    mutationFn: ingredientService.createCategory,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: ingredientKeys.categories() });
    },
  });
  return mutation;
};
