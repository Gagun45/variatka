import { IRecipeSeriesFilter } from "@/lib/constants/series.options";
import { IStockType } from "@/lib/constants/stock.options";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import {
  IPublicRecipeSortType,
  PUBLIC_RECIPE_SORTERS,
} from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";

import { useMemo } from "react";

export function usePublicRecipesFilter({
  recipes,
  searchQuery,
  category,
  stock,
  sort,
  series,
}: {
  recipes: IPublicRecipe[];
  searchQuery: string;
  category: IRecipeCategoryFilter;
  stock: IStockType;
  sort: IPublicRecipeSortType;
  series: IRecipeSeriesFilter;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = recipes;

    // 1. CATEGORY
    if (category !== "all") {
      result = result.filter((recipe) => recipe.category === category);
    }

    // 2. SEARCH
    if (query.length > 0) {
      result = result.filter((recipe) =>
        recipe.title.toLowerCase().includes(query),
      );
    }

    // 3. STOCK
    if (stock === "in") {
      result = result.filter((recipe) => recipe.isInStock);
    } else if (stock === "out") {
      result = result.filter((recipe) => !recipe.isInStock);
    }

    if (series !== "all") {
      result = result.filter((r) => r.series === series);
    }

    // 4. SORT
    return [...result].sort(PUBLIC_RECIPE_SORTERS[sort]);
  }, [recipes, searchQuery, category, stock, sort, series]);
}
