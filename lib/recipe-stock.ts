type RecipeWithVariantStock = {
  variants: ReadonlyArray<{ inStock: number }>;
};

export const getRecipeStock = (recipe: RecipeWithVariantStock): number =>
  recipe.variants.reduce((total, variant) => total + variant.inStock, 0);

export const isRecipeInStock = (recipe: RecipeWithVariantStock): boolean =>
  recipe.variants.some((variant) => variant.inStock > 0);
