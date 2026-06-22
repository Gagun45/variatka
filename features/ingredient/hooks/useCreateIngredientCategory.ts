import { IIngredientCategory } from "@/lib/prisma.args";
import { ICreateIngredientCategoryDto } from "@/zod/ingredient.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { toast } from "sonner";

export const useCreateIngredientCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IIngredientCategory,
    Error,
    ICreateIngredientCategoryDto
  >({
    mutationFn: ingredientService.createCategory,
    onSuccess: (newIngredientCategory) => {
      qclient.setQueryData<IIngredientCategory[]>(
        ingredientKeys.categories,
        (old = []) => [newIngredientCategory, ...old],
      );
      toast.success("Category created successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
