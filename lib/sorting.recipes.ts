import { IRecipe } from "./prisma.args";

export const RECIPE_SORTERS = {
  "name-asc": (a: IRecipe, b: IRecipe) => a.title.localeCompare(b.title),

  "name-desc": (a: IRecipe, b: IRecipe) => b.title.localeCompare(a.title),

  newest: (a: IRecipe, b: IRecipe) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),

  oldest: (a: IRecipe, b: IRecipe) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
} as const;

export const RECIPE_SORT_LABELS = {
  "name-asc": "A-Z",
  "name-desc": "Z-A",
  newest: "Newest",
  oldest: "Oldest",
} as const;

export type IRecipeSortType = keyof typeof RECIPE_SORTERS;
export const RECIPE_SORT_OPTIONS = Object.keys(RECIPE_SORTERS).map((key) => ({
  value: key as IRecipeSortType,
  label: RECIPE_SORT_LABELS[key as IRecipeSortType],
}));
