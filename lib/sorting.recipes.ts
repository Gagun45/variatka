import { IRecipe } from "./prisma.args";

export const getMissingIngredientsCount = (recipe: IRecipe) =>
  recipe.ingredients.filter((i) => !i.ingredient.isInStock).length;

export const RECIPE_SORTERS = {
  "name-asc": (a: IRecipe, b: IRecipe) => a.title.localeCompare(b.title),

  "name-desc": (a: IRecipe, b: IRecipe) => b.title.localeCompare(a.title),

  newest: (a: IRecipe, b: IRecipe) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),

  oldest: (a: IRecipe, b: IRecipe) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  "missing-asc": (a: IRecipe, b: IRecipe) =>
    getMissingIngredientsCount(a) - getMissingIngredientsCount(b),

  "missing-desc": (a: IRecipe, b: IRecipe) =>
    getMissingIngredientsCount(b) - getMissingIngredientsCount(a),
} as const;

export const RECIPE_SORT_LABELS = {
  "name-asc": "A-Z",
  "name-desc": "Z-A",
  newest: "Newest",
  oldest: "Oldest",
  "missing-asc": "Fewest missing",
  "missing-desc": "Most missing",
} as const;

export type IRecipeSortType = keyof typeof RECIPE_SORTERS;
export const RECIPE_SORT_OPTIONS = Object.keys(RECIPE_SORTERS).map((key) => ({
  value: key as IRecipeSortType,
  label: RECIPE_SORT_LABELS[key as IRecipeSortType],
}));
