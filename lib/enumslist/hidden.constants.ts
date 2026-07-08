import { Eye, EyeOff, Layers } from "lucide-react";
import { IOption } from "../types";

export type IRecipeHiddenFilter = "all" | "hidden" | "visible";

export const RECIPE_HIDDEN_FILTER_OPTIONS: IOption<IRecipeHiddenFilter>[] = [
  {
    value: "all",
    label: "All",
    icon: Layers,
  },
  {
    value: "hidden",
    label: "Hidden",
    icon: EyeOff,
    iconClassName: "text-orange-500",
  },
  {
    value: "visible",
    label: "Visible",
    icon: Eye,
    iconClassName: "text-green-500",
  },
];
