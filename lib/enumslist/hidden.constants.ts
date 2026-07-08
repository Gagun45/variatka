import { IOption } from "../types";

export type IRecipeHiddenFilter = "all" | "hidden" | "visible";

export const RECIPE_HIDDEN_FILTER_OPTIONS: IOption<IRecipeHiddenFilter>[] = [
  { value: "all", label: "All" },
  { value: "hidden", label: "Hidden" },
  { value: "visible", label: "Visible" },
];
