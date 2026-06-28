import { IOption } from "../types";
// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const RECIPE_CATEGORIES = {
  SPICES: "SPICES",
  JAMS: "JAMS",
  SAUCES: "SAUCES",
} as const;

// 2. Derive the type from the object
export type IRecipeCategory =
  (typeof RECIPE_CATEGORIES)[keyof typeof RECIPE_CATEGORIES];

// 3. Map your labels safely
export const RECIPE_CATEGORIES_DATA: Record<
  IRecipeCategory,
  {
    label: string;
  }
> = {
  SPICES: {
    label: "Спеції",
  },
  JAMS: {
    label: "Повидло",
  },
  SAUCES: {
    label: "Соуси",
  },
};

export type IRecipeCategoryFilter = "all" | IRecipeCategory;

export const RECIPE_CATEGORY_ONLY_OPTIONS: IOption<IRecipeCategory>[] = [
  ...Object.values(RECIPE_CATEGORIES).map((category) => ({
    value: category,
    label: RECIPE_CATEGORIES_DATA[category].label,
  })),
];

export const RECIPE_CATEGORY_FILTER_OPTIONS: IOption<IRecipeCategoryFilter>[] =
  [{ value: "all", label: "All" }, ...RECIPE_CATEGORY_ONLY_OPTIONS];
