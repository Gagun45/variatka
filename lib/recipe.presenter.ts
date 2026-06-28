import { IRecipe } from "./prisma.args";
import { IPublicRecipe } from "./types";

export const recipePresenter = {
  toPublic: (r: IRecipe): IPublicRecipe => ({
    id: r.id,
    title: r.title,
    description: r.description,
    notes: r.notes,
    isInStock: !!r.inStock,
    series: r.series,
    spicy: r.spicy,
    imageKey: r.imageKey,
    category: r.category,
    ingredients: r.ingredients.map((ri) => ({
      id: ri.ingredientId,
      title: ri.ingredient.title,
    })),
  }),
};
