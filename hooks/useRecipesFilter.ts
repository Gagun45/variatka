import { useMemo } from "react";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORTERS } from "@/lib/sorting.recipes";
import { IStockType } from "@/lib/constants/stock.options";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";

export function useRecipesFilter({
  recipes,
  searchQuery,
  categoryId,
  stock,
  readyToMake,
  sort,
}: {
  recipes: IRecipe[];
  searchQuery: string;
  categoryId?: number;
  stock: IStockType;
  readyToMake: IReadyToMakeType;
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

    // 3. STOCK FILTER
    const stockFiltered =
      stock === "in"
        ? searched.filter((r) => r.inStock)
        : stock === "out"
          ? searched.filter((r) => !r.inStock)
          : searched;

    // 4. READY TO MAKE FILTER
    const readyFiltered = stockFiltered.filter((recipe) => {
      if (readyToMake === "all") return true;

      const isReadyToMake = !recipe.ingredients.some(
        (i) => !i.ingredient.isInStock,
      );

      return readyToMake === "ready" ? isReadyToMake : !isReadyToMake;
    });

    // 5. SORT
    return [...readyFiltered].sort(RECIPE_SORTERS[sort]);
  }, [recipes, searchQuery, categoryId, stock, readyToMake, sort]);
}
