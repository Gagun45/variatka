import { IConfirmedType } from "@/lib/constants/confirmed.optionts";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";
import { IStockType } from "@/lib/constants/stock.options";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORTERS } from "@/lib/sorting.recipes";
import { useMemo } from "react";

export function useRecipesFilter({
  recipes,
  searchQuery,
  category,
  stock,
  readyToMake,
  confirmed,
  sort,
  series,
}: {
  recipes: IRecipe[];
  searchQuery: string;
  category: IRecipeCategoryFilter;
  stock: IStockType;
  readyToMake: IReadyToMakeType;
  confirmed: IConfirmedType;
  sort: IRecipeSortType;
  series: IRecipeSeriesFilter;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = recipes;

    // 1. CATEGORY (base scope)
    if (category !== "all") {
      result = result.filter((r) => r.category === category);
    }

    // 2. SEARCH (inside category scope)
    if (query.length > 0) {
      result = result.filter((r) => r.title.toLowerCase().includes(query));
    }

    // 3. STOCK
    if (stock === "in") {
      result = result.filter((r) => r.inStock);
    } else if (stock === "out") {
      result = result.filter((r) => !r.inStock);
    }

    // 4. READY
    result = result.filter((recipe) => {
      if (readyToMake === "all") return true;

      const isReady = !recipe.ingredients.some((i) => !i.ingredient.isInStock);

      return readyToMake === "ready" ? isReady : !isReady;
    });

    // 5. CONFIRMED
    result = result.filter((recipe) => {
      if (confirmed === "all") return true;
      return confirmed === "confirmed"
        ? recipe.isConfirmed
        : !recipe.isConfirmed;
    });

    // 6. SERIES
    result = result.filter((recipe) => {
      if (series === "all") return true;
      return recipe.series === series;
    });

    // 7. SORT
    return [...result].sort(RECIPE_SORTERS[sort]);
  }, [
    recipes,
    searchQuery,
    category,
    stock,
    readyToMake,
    confirmed,
    series,
    sort,
  ]);
}
