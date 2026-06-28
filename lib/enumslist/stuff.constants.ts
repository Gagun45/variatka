import { IOption } from "../types";
// frontend/constants.ts

// 1. Create a browser-safe pseudo-enum
export const STUFF_CATEGORIES = {
  DECOR: "DECOR",
  JARS: "JARS",
} as const;

// 2. Derive the type from the object
export type IStuffCategory =
  (typeof STUFF_CATEGORIES)[keyof typeof STUFF_CATEGORIES];

// 3. Map your labels safely
export const STUFF_CATEGORIES_DATA: Record<
  IStuffCategory,
  {
    label: string;
  }
> = {
  DECOR: {
    label: "Пакування та декор",
  },
  JARS: {
    label: "Слоїчки",
  },
};

export type IStuffCategoryFilter = "all" | IStuffCategory;

export const STUFF_CATEGORY_ONLY_OPTIONS: IOption<IStuffCategory>[] = [
  ...Object.values(STUFF_CATEGORIES).map((category) => ({
    value: category,
    label: STUFF_CATEGORIES_DATA[category].label,
  })),
];

export const STUFF_CATEGORY_FILTER_OPTIONS: IOption<IStuffCategoryFilter>[] = [
  { value: "all", label: "All" },
  ...STUFF_CATEGORY_ONLY_OPTIONS,
];
