import { useMemo } from "react";

import { IStockType } from "@/lib/constants/stock.options";
import {
  IPublicRecipeSortType,
  PUBLIC_RECIPE_SORTERS,
} from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";

export function usePublicRecipesFilter({
  recipes,
  searchQuery,
  categoryId,
  stock,
  sort,
}: {
  recipes: IPublicRecipe[];
  searchQuery: string;
  categoryId?: number;
  stock: IStockType;
  sort: IPublicRecipeSortType;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query.length > 0;

    const base = isSearching
      ? recipes.filter((r) => r.title.toLowerCase().includes(query))
      : categoryId
        ? recipes.filter((r) => r.recipeCategory.id === categoryId)
        : recipes;

    const stockFiltered =
      stock === "in"
        ? base.filter((r) => r.isInStock)
        : stock === "out"
          ? base.filter((r) => !r.isInStock)
          : base;

    return [...stockFiltered].sort(PUBLIC_RECIPE_SORTERS[sort]);
  }, [recipes, searchQuery, categoryId, stock, sort]);
}
