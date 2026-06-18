import { useMemo } from "react";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORTERS } from "@/lib/sorting.recipes";
import { IStockType } from "@/lib/constants/stock.options";

export function useRecipesFilter({
  recipes,
  searchQuery,
  categoryId,
  stock,
  sort,
}: {
  recipes: IRecipe[];
  searchQuery: string;
  categoryId?: number;
  stock: IStockType;
  sort: IRecipeSortType;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query.length > 0;

    // 1. CATEGORY FILTER
    const categoryFiltered = categoryId
      ? recipes.filter((r) => r.recipeCategoryId === categoryId)
      : recipes;

    // 2. SEARCH (category-aware)
    const searched = isSearching
      ? categoryFiltered.filter((r) => r.title.toLowerCase().includes(query))
      : categoryFiltered;

    // 3. STOCK FILTER (optional — keep only if recipes have isInStock)
    const stockFiltered =
      stock === "in"
        ? searched.filter((r) => !!r.inStock)
        : stock === "out"
          ? searched.filter((r) => !r.inStock)
          : searched;

    // 4. SORT
    return [...stockFiltered].sort(RECIPE_SORTERS[sort]);
  }, [recipes, searchQuery, categoryId, stock, sort]);
}
