import type { RecipeVariant } from "@prisma/client";
import type { QueryClient } from "@tanstack/react-query";

import type { IRecipe } from "@/lib/prisma.args";
import type { IPublicRecipe, IPublicRecipeVariant } from "@/lib/types";
import { recipeKeys } from "@/features/recipe/recipe.keys";

const bySortOrder = (
  a: Pick<RecipeVariant, "id" | "sortOrder">,
  b: Pick<RecipeVariant, "id" | "sortOrder">,
) => a.sortOrder - b.sortOrder || a.id - b.id;

const toPublicVariant = ({
  id,
  label,
  inStock,
  sortOrder,
}: RecipeVariant): IPublicRecipeVariant => ({
  id,
  label,
  inStock,
  sortOrder,
});

export const addVariantToRecipeCaches = (
  queryClient: QueryClient,
  variant: RecipeVariant,
) => {
  queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (recipes = []) =>
    recipes.map((recipe) =>
      recipe.id === variant.recipeId
        ? {
            ...recipe,
            variants: [...recipe.variants, variant].sort(bySortOrder),
          }
        : recipe,
    ),
  );

  const publicVariant = toPublicVariant(variant);
  queryClient.setQueryData<IPublicRecipe[]>(recipeKeys.public, (recipes) =>
    recipes?.map((recipe) =>
      recipe.id === variant.recipeId
        ? {
            ...recipe,
            variants: [...recipe.variants, publicVariant].sort(bySortOrder),
          }
        : recipe,
    ),
  );
  queryClient.setQueryData<IPublicRecipe>(
    recipeKeys.publicOne(variant.recipeId),
    (recipe) =>
      recipe
        ? {
            ...recipe,
            variants: [...recipe.variants, publicVariant].sort(bySortOrder),
          }
        : recipe,
  );
};

export const removeVariantFromRecipeCaches = (
  queryClient: QueryClient,
  recipeId: number,
  variantId: number,
) => {
  queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (recipes = []) =>
    recipes.map((recipe) =>
      recipe.id === recipeId
        ? {
            ...recipe,
            variants: recipe.variants.filter(
              (variant) => variant.id !== variantId,
            ),
          }
        : recipe,
    ),
  );

  queryClient.setQueryData<IPublicRecipe[]>(recipeKeys.public, (recipes) =>
    recipes?.map((recipe) =>
      recipe.id === recipeId
        ? {
            ...recipe,
            variants: recipe.variants.filter(
              (variant) => variant.id !== variantId,
            ),
          }
        : recipe,
    ),
  );
  queryClient.setQueryData<IPublicRecipe>(
    recipeKeys.publicOne(recipeId),
    (recipe) =>
      recipe
        ? {
            ...recipe,
            variants: recipe.variants.filter(
              (variant) => variant.id !== variantId,
            ),
          }
        : recipe,
  );
};

export const updateVariantStockInRecipeCaches = (
  queryClient: QueryClient,
  recipeId: number,
  variantId: number,
  inStock: number,
) => {
  queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (recipes = []) =>
    recipes.map((recipe) =>
      recipe.id === recipeId
        ? {
            ...recipe,
            variants: recipe.variants.map((variant) =>
              variant.id === variantId ? { ...variant, inStock } : variant,
            ),
          }
        : recipe,
    ),
  );

  queryClient.setQueryData<IPublicRecipe[]>(recipeKeys.public, (recipes) =>
    recipes?.map((recipe) =>
      recipe.id === recipeId
        ? {
            ...recipe,
            variants: recipe.variants.map((variant) =>
              variant.id === variantId ? { ...variant, inStock } : variant,
            ),
          }
        : recipe,
    ),
  );
  queryClient.setQueryData<IPublicRecipe>(
    recipeKeys.publicOne(recipeId),
    (recipe) =>
      recipe
        ? {
            ...recipe,
            variants: recipe.variants.map((variant) =>
              variant.id === variantId ? { ...variant, inStock } : variant,
            ),
          }
        : recipe,
  );
};

export const invalidateRecipeVariantCaches = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
  queryClient.invalidateQueries({ queryKey: recipeKeys.public });
};
