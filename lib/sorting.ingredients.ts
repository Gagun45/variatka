import { IIngredient } from "./prisma.args";

export const INGREDIENT_SORTERS = {
  "name-asc": (a: IIngredient, b: IIngredient) =>
    a.title.localeCompare(b.title),

  "name-desc": (a: IIngredient, b: IIngredient) =>
    b.title.localeCompare(a.title),

  "usage-desc": (a: IIngredient, b: IIngredient) =>
    (b._count?.recipeIngredients ?? 0) - (a._count?.recipeIngredients ?? 0) ||
    a.title.localeCompare(b.title),

  "usage-asc": (a: IIngredient, b: IIngredient) =>
    (a._count?.recipeIngredients ?? 0) - (b._count?.recipeIngredients ?? 0) ||
    a.title.localeCompare(b.title),
  newest: (a: IIngredient, b: IIngredient) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),

  oldest: (a: IIngredient, b: IIngredient) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
} as const;

export const INGREDIENT_SORT_LABELS = {
  "name-asc": "A-Z",
  "name-desc": "Z-A",
  "usage-desc": "Most used",
  "usage-asc": "Least used",
  newest: "Newest",
  oldest: "Oldest",
} as const;

export type IIngredientSortType = keyof typeof INGREDIENT_SORTERS;

export const INGREDIENT_SORT_OPTIONS = Object.keys(INGREDIENT_SORTERS).map(
  (key) => ({
    value: key as IIngredientSortType,
    label: INGREDIENT_SORT_LABELS[key as IIngredientSortType],
  }),
);
