export const recipeVariantKeys = {
  all: ["recipe-variants"] as const,
  create: () => [...recipeVariantKeys.all, "create"] as const,
  delete: () => [...recipeVariantKeys.all, "delete"] as const,
  stock: () => [...recipeVariantKeys.all, "stock"] as const,
};
