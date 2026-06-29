// frontend/constants.ts

import { ChefHat, Crown, UtensilsCrossed } from "lucide-react";
import { IOption } from "../types";
import { IOptionListType } from "./types";

// 1. Create a browser-safe pseudo-enum
export const RECIPE_SERIES = {
  DEFAULT: "DEFAULT",
  NOMLYGOLD: "NOMLYGOLD",
} as const;

// 2. Derive the type from the object
export type IRecipeSeries = (typeof RECIPE_SERIES)[keyof typeof RECIPE_SERIES];

// 3. Map your labels safely
export const RECIPE_SERIES_DATA: Record<IRecipeSeries, IOptionListType> = {
  DEFAULT: {
    label: "Standard",
    icon: ChefHat,
  },
  NOMLYGOLD: {
    label: "Nomly Gold Premium",
    icon: Crown,
    iconClassName: "text-yellow-500",
  },
};

export type IRecipeSeriesFilter = "all" | IRecipeSeries;

export const RECIPE_SERIES_ONLY_OPTIONS: IOption<IRecipeSeries>[] =
  Object.values(RECIPE_SERIES).map(
    (category): IOption<IRecipeSeries> => ({
      value: category,
      label: RECIPE_SERIES_DATA[category].label,
      icon: RECIPE_SERIES_DATA[category].icon,
      className: RECIPE_SERIES_DATA[category].className,
      iconClassName: RECIPE_SERIES_DATA[category].iconClassName,
    }),
  );

export const RECIPE_SERIES_FILTER_OPTIONS: IOption<IRecipeSeriesFilter>[] = [
  { value: "all", label: "All", icon: UtensilsCrossed },
  ...RECIPE_SERIES_ONLY_OPTIONS,
];

export const RECIPES_SERIES_FILTER_OPTIONS_VALUES =
  RECIPE_SERIES_FILTER_OPTIONS.map((o) => o.value);
