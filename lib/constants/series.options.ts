import {
  IRecipeSeries,
  RECIPE_SERIES,
  RECIPE_SERIES_LABELS,
} from "../constants";
import { IOption } from "../types";

export type IRecipeSeriesFilter = "all" | IRecipeSeries;

export const RECIPE_SERIES_OPTIONS: IOption<IRecipeSeriesFilter>[] = [
  { value: "all", label: "All" },
  { value: RECIPE_SERIES.NOMLYGOLD, label: RECIPE_SERIES_LABELS["NOMLYGOLD"] },
  { value: RECIPE_SERIES.DEFAULT, label: RECIPE_SERIES_LABELS["DEFAULT"] },
];
