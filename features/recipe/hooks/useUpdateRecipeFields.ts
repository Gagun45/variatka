import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipeDto } from "@/zod/recipe.schema";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

export const useUpdateRecipeFields = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, { id: number; dto: IRecipeDto }>(
    {
      mutationFn: ({ dto, id }) => recipeService.updateFields(id, dto),
      onSuccess: () => {
        qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
        toast.success("Recipe edited successfully!");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    },
  );
  return mutation;
};
