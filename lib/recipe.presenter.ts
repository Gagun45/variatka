import { IRecipe } from "./prisma.args";
import { IPublicRecipe } from "./types";

export const recipePresenter = {
  toPublic: (r: IRecipe): IPublicRecipe => ({
    id: r.id,
    title: r.title,
    description: r.description,
    notes: r.notes,
    isInStock: !!r.inStock,
    isPremium: r.isPremium,
    spicy: r.spicy,
    imageKey: r.imageKey,
    recipeCategory: {
      id: r.recipeCategory.id,
      title: r.recipeCategory.title,
    },
    ingredients: r.ingredients.map((ri) => ({
      id: ri.ingredientId,
      title: ri.ingredient.title,
    })),
  }),
};
