export const recipeKeys = {
  recipes: ["recipes"] as const,
  public: ["public-recipes"] as const,
  publicOne: (id: number) => ["public-recipes", id] as const,
  wishlistIds: ["wishlist-ids"] as const,
};
