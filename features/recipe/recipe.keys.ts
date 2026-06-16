export const recipeKeys = {
  recipes: ["recipes"] as const,
  categories: () => ["recipe-categories"],
  recipesByIngredientId: (ingredientId: number) => [
    "ing-recipes",
    ingredientId,
  ],
  recipe: (id: number) => ["recipe", id],
};
