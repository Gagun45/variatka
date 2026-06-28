import { IOption } from "../types";
// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const INGREDIENT_CATEGORIES = {
  SPICES: "SPICES",
  OTHER: "OTHER",
} as const;

// 2. Derive the type from the object
export type IIngredientCategory =
  (typeof INGREDIENT_CATEGORIES)[keyof typeof INGREDIENT_CATEGORIES];

// 3. Map your labels safely
export const INGREDIENT_CATEGORIES_DATA: Record<
  IIngredientCategory,
  {
    label: string;
  }
> = {
  SPICES: {
    label: "Спеції",
  },
  OTHER: {
    label: "Інше",
  },
};

export type IIngredientCategoryFilter = "all" | IIngredientCategory;

export const INGREDIENT_CATEGORY_ONLY_OPTIONS: IOption<IIngredientCategory>[] =
  [
    ...Object.values(INGREDIENT_CATEGORIES).map((category) => ({
      value: category,
      label: INGREDIENT_CATEGORIES_DATA[category].label,
    })),
  ];

export const INGREDIENT_CATEGORY_FILTER_OPTIONS: IOption<IIngredientCategoryFilter>[] =
  [{ value: "all", label: "All" }, ...INGREDIENT_CATEGORY_ONLY_OPTIONS];
