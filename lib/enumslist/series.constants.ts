import type { RecipeSeries } from "@prisma/client";
import { ChefHat, Crown, UtensilsCrossed } from "lucide-react";
import { IOption } from "../types";
import { IOptionListType } from "./types";

export const RECIPE_SERIES = [
  "DEFAULT",
  "NOMLYGOLD",
] as const satisfies readonly RecipeSeries[];

export type IRecipeSeries = RecipeSeries;

export const RECIPE_SERIES_DATA: Record<RecipeSeries, IOptionListType> = {
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
  RECIPE_SERIES.map(
    (category): IOption<IRecipeSeries> => ({
      value: category,
      ...RECIPE_SERIES_DATA[category],
    }),
  );

export const RECIPE_SERIES_FILTER_OPTIONS: IOption<IRecipeSeriesFilter>[] = [
  { value: "all", label: "All", icon: UtensilsCrossed },
  ...RECIPE_SERIES_ONLY_OPTIONS,
];

export const RECIPES_SERIES_FILTER_OPTIONS_VALUES =
  RECIPE_SERIES_FILTER_OPTIONS.map((o) => o.value);
