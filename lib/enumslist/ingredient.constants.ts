import { Boxes, Package } from "lucide-react";
import { GiSaltShaker } from "react-icons/gi";
import { IOption } from "../types";
import { IOptionListType } from "./types";
import type { IngredientCategories } from "@prisma/client";

export const INGREDIENT_CATEGORIES = [
  "SPICES",
  "OTHER",
] as const satisfies readonly IngredientCategories[];

export type IIngredientCategory = IngredientCategories;

export const INGREDIENT_CATEGORIES_DATA = {
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
} satisfies Record<IngredientCategories, IOptionListType>;

export type IIngredientCategoryFilter = "all" | IIngredientCategory;

export const INGREDIENT_CATEGORY_ONLY_OPTIONS: IOption<IIngredientCategory>[] =
  INGREDIENT_CATEGORIES.map(
    (category): IOption<IIngredientCategory> => ({
      value: category,
      ...INGREDIENT_CATEGORIES_DATA[category],
    }),
  );

export const INGREDIENT_CATEGORY_FILTER_OPTIONS: IOption<IIngredientCategoryFilter>[] =
  [
    { value: "all", label: "All", icon: Boxes },
    ...INGREDIENT_CATEGORY_ONLY_OPTIONS,
  ];
