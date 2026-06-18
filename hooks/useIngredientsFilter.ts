import { useMemo } from "react";
import { IIngredient } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORTERS,
} from "@/lib/sorting.ingredients";
import { IStockType } from "@/lib/constants/stock.options";

export function useIngredientsFilter({
  ingredients,
  searchQuery,
  categoryId,
  stock,
  sort,
}: {
  ingredients: IIngredient[];
  searchQuery: string;
  categoryId?: number;
  stock: IStockType;
  sort: IIngredientSortType;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query.length > 0;

    // 1. CATEGORY FILTER (always applied first)
    const categoryFiltered = categoryId
      ? ingredients.filter((i) => i.categoryId === categoryId)
      : ingredients;

    // 2. SEARCH (category-aware now)
    const searched = isSearching
      ? categoryFiltered.filter((i) => i.title.toLowerCase().includes(query))
      : categoryFiltered;

    // 3. STOCK FILTER (only when NOT searching OR still useful)
    const stockFiltered =
      stock === "in"
        ? searched.filter((i) => i.isInStock)
        : stock === "out"
          ? searched.filter((i) => !i.isInStock)
          : searched;

    // 4. SORT
    return [...stockFiltered].sort(INGREDIENT_SORTERS[sort]);
  }, [ingredients, searchQuery, categoryId, stock, sort]);
}
