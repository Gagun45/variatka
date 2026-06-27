export const recipeKeys = {
  recipes: ["recipes"] as const,
  recipe: (id: number) => [...recipeKeys.recipes, id],
  categories: ["recipe-categories"] as const,
  public: ["public-recipes"] as const,
  wishlist: ["wishlist-recipes"] as const,
  adminWishlists: ["admin-wishlists"] as const,
};
