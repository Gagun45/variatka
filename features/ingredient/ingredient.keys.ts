export const ingredientKeys = {
  ingredients: ["ingredients"] as const,
  categories: () => [...ingredientKeys.ingredients, "categories"],
  ingredient: (id: number) => ["ingredient", id],
};
