import { Boxes, Package } from "lucide-react";
import { GiSaltShaker } from "react-icons/gi";
import { IOption } from "../types";
import { IOptionListType } from "./types";
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
  IOptionListType
> = {
  SPICES: {
    label: "Спеції",
    icon: GiSaltShaker,
    iconClassName: "text-orange-500",
  },
  OTHER: {
    label: "Інше",
    icon: Package,
    iconClassName: "text-muted-foreground",
  },
};

export type IIngredientCategoryFilter = "all" | IIngredientCategory;

export const INGREDIENT_CATEGORY_ONLY_OPTIONS: IOption<IIngredientCategory>[] =
  [
    ...Object.values(INGREDIENT_CATEGORIES).map(
      (category): IOption<IIngredientCategory> => ({
        value: category,
        label: INGREDIENT_CATEGORIES_DATA[category].label,
        icon: INGREDIENT_CATEGORIES_DATA[category].icon,
        className: INGREDIENT_CATEGORIES_DATA[category].className,
        iconClassName: INGREDIENT_CATEGORIES_DATA[category].iconClassName,
      }),
    ),
  ];

export const INGREDIENT_CATEGORY_FILTER_OPTIONS: IOption<IIngredientCategoryFilter>[] =
  [
    { value: "all", label: "All", icon: Boxes },
    ...INGREDIENT_CATEGORY_ONLY_OPTIONS,
  ];
