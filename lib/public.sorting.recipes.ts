import { IPublicRecipe } from "./types";

export const PUBLIC_RECIPE_SORTERS = {
  "name-asc": (a: IPublicRecipe, b: IPublicRecipe) =>
    a.title.localeCompare(b.title),

  "name-desc": (a: IPublicRecipe, b: IPublicRecipe) =>
    b.title.localeCompare(a.title),
} as const;

export const PUBLIC_RECIPE_SORT_LABELS = {
  "name-asc": "A-Z",
  "name-desc": "Z-A",
} as const;

export type IPublicRecipeSortType = keyof typeof PUBLIC_RECIPE_SORTERS;

export const PUBLIC_RECIPE_SORT_OPTIONS = Object.keys(
  PUBLIC_RECIPE_SORTERS,
).map((key) => ({
  value: key as IPublicRecipeSortType,
  label: PUBLIC_RECIPE_SORT_LABELS[key as IPublicRecipeSortType],
}));

export const PUBLIC_RECIPE_SORT_OPTIONS_VALUES = PUBLIC_RECIPE_SORT_OPTIONS.map(
  (o) => o.value,
);
