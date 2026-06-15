import { ICategory } from "@/lib/prisma.args";
import { ICreateCategoryFormValues } from "@/zod/category.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../category.api";
import { categoryKeys } from "../category.keys";

export const useCreateCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<ICategory, Error, ICreateCategoryFormValues>({
    mutationFn: categoryService.create,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: categoryKeys.categories });
    },
  });
  return mutation;
};
