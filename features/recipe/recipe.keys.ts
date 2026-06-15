export const recipeKeys = {
  recipes: ["recipes"] as const,
  categories: () => [...recipeKeys.recipes, "categories"],
  recipesByIngredientId: (ingredientId: number) => [
    ...recipeKeys.recipes,
    ingredientId,
  ],
};
