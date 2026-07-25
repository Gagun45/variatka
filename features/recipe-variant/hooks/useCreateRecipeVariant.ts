import type { RecipeVariant } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ICreateRecipeVariantDto } from "@/zod/recipe-variant.schema";
import {
  addVariantToRecipeCaches,
  invalidateRecipeVariantCaches,
} from "../recipe-variant.cache";
import { recipeVariantService } from "../recipe-variant.api";
import { recipeVariantKeys } from "../recipe-variant.keys";

type TVariables = {
  recipeId: number;
  dto: ICreateRecipeVariantDto;
};

export const useCreateRecipeVariant = () => {
  const queryClient = useQueryClient();

  return useMutation<RecipeVariant, Error, TVariables>({
    mutationKey: recipeVariantKeys.create(),
    mutationFn: ({ recipeId, dto }) =>
      recipeVariantService.create(recipeId, dto),
    onSuccess: (variant) => {
      addVariantToRecipeCaches(queryClient, variant);
      invalidateRecipeVariantCaches(queryClient);
      toast.success("Recipe variant created!");
    },
    onError: (error) => toast.error(error.message),
  });
};
