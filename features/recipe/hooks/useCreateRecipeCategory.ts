import { IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useCreateRecipeCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IRecipeCategory,
    Error,
    ICreateRecipeCategoryDto
  >({
    mutationFn: recipeService.createCategory,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.categories });
    },
  });
  return mutation;
};
