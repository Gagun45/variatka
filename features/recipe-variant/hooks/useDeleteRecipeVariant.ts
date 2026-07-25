import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  invalidateRecipeVariantCaches,
  removeVariantFromRecipeCaches,
} from "../recipe-variant.cache";
import { recipeVariantService } from "../recipe-variant.api";
import { recipeVariantKeys } from "../recipe-variant.keys";

type TVariables = {
  recipeId: number;
  variantId: number;
};

export const useDeleteRecipeVariant = () => {
  const queryClient = useQueryClient();

  return useMutation<number, Error, TVariables>({
    mutationKey: recipeVariantKeys.delete(),
    mutationFn: ({ variantId }) => recipeVariantService.delete(variantId),
    onSuccess: (variantId, { recipeId }) => {
      removeVariantFromRecipeCaches(queryClient, recipeId, variantId);
      invalidateRecipeVariantCaches(queryClient);
      toast.success("Recipe variant deleted!");
    },
    onError: (error) => toast.error(error.message),
  });
};
