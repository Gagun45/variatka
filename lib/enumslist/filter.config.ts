// constants/filters.ts

import { CONFIRMED_OPTIONS } from "../constants/confirmed.optionts";
import { READY_TO_MAKE_OPTIONS } from "../constants/ready-to-make.options";
import { STOCK_OPTIONS } from "../constants/stock.options";
import { RECIPE_HIDDEN_FILTER_OPTIONS } from "./hidden.constants";
import { INGREDIENT_CATEGORY_FILTER_OPTIONS } from "./ingredient.constants";
import {
  RECIPE_CATEGORY_FILTER_OPTIONS,
  RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS,
} from "./recipe.constants";
import { RECIPE_SERIES_FILTER_OPTIONS } from "./series.constants";
import { STUFF_CATEGORY_FILTER_OPTIONS } from "./stuff.constants";

export const FILTER_CONFIGS = {
  recipes: {
    category: {
      label: "Category",
      options: RECIPE_CATEGORY_FILTER_OPTIONS,
    },
    stock: {
      label: "Availability",
      options: STOCK_OPTIONS,
    },
    ready: {
      label: "Preparation",
      options: READY_TO_MAKE_OPTIONS,
    },
    series: {
      label: "Series",
      options: RECIPE_SERIES_FILTER_OPTIONS,
    },
    confirmed: {
      label: "Status",
      options: CONFIRMED_OPTIONS,
    },
    hidden: {
      label: "Visibility",
      options: RECIPE_HIDDEN_FILTER_OPTIONS,
    },
  },
  ingredients: {
    category: {
      label: "Category",
      options: INGREDIENT_CATEGORY_FILTER_OPTIONS,
    },
    stock: {
      label: "Availability",
      options: STOCK_OPTIONS,
    },
  },
  stuff: {
    category: {
      label: "Category",
      options: STUFF_CATEGORY_FILTER_OPTIONS,
    },
  },
  publicRecipes: {
    category: {
      label: "Category",
      options: RECIPE_CATEGORY_PUBLIC_FILTER_OPTIONS,
    },
  },
} as const;
