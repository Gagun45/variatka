import type { IRecipe } from "@/lib/prisma.args";
import type { IPublicRecipe } from "@/lib/types";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import type { RecipeVariant } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  invalidateRecipeVariantCaches,
  updateVariantStockInRecipeCaches,
} from "../recipe-variant.cache";
import { recipeVariantService } from "../recipe-variant.api";
import { recipeVariantKeys } from "../recipe-variant.keys";

type TVariables = {
  recipeId: number;
  variantId: number;
  inStock: number;
};

type TContext = {
  previousRecipes?: IRecipe[];
  previousPublicRecipes?: IPublicRecipe[];
  previousPublicRecipe?: IPublicRecipe;
};

export const useUpdateRecipeVariantStock = () => {
  const queryClient = useQueryClient();

  return useMutation<RecipeVariant, Error, TVariables, TContext>({
    mutationKey: recipeVariantKeys.stock(),
    mutationFn: ({ variantId, inStock }) =>
      recipeVariantService.updateStock(variantId, inStock),
    onMutate: async ({ recipeId, variantId, inStock }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: recipeKeys.recipes }),
        queryClient.cancelQueries({ queryKey: recipeKeys.public }),
      ]);

      const previousRecipes = queryClient.getQueryData<IRecipe[]>(
        recipeKeys.recipes,
      );
      const previousPublicRecipes = queryClient.getQueryData<IPublicRecipe[]>(
        recipeKeys.public,
      );
      const previousPublicRecipe = queryClient.getQueryData<IPublicRecipe>(
        recipeKeys.publicOne(recipeId),
      );

      updateVariantStockInRecipeCaches(
        queryClient,
        recipeId,
        variantId,
        inStock,
      );

      return {
        previousRecipes,
        previousPublicRecipes,
        previousPublicRecipe,
      };
    },
    onError: (error, { recipeId }, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(
          recipeKeys.recipes,
          context.previousRecipes,
        );
      }
      if (context?.previousPublicRecipes) {
        queryClient.setQueryData(
          recipeKeys.public,
          context.previousPublicRecipes,
        );
      }
      if (context?.previousPublicRecipe) {
        queryClient.setQueryData(
          recipeKeys.publicOne(recipeId),
          context.previousPublicRecipe,
        );
      }
      toast.error(error.message);
    },
    onSuccess: (variant) => {
      updateVariantStockInRecipeCaches(
        queryClient,
        variant.recipeId,
        variant.id,
        variant.inStock,
      );
      toast.success("Variant stock updated!");
    },
    onSettled: () => invalidateRecipeVariantCaches(queryClient),
  });
};
