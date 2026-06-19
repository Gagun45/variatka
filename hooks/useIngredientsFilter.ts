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

    // Search globally across all ingredients
    const base = isSearching
      ? ingredients.filter((i) => i.title.toLowerCase().includes(query))
      : categoryId
        ? ingredients.filter((i) => i.categoryId === categoryId)
        : ingredients;

    const stockFiltered =
      stock === "in"
        ? base.filter((i) => i.isInStock)
        : stock === "out"
          ? base.filter((i) => !i.isInStock)
          : base;

    return [...stockFiltered].sort(INGREDIENT_SORTERS[sort]);
  }, [ingredients, searchQuery, categoryId, stock, sort]);
}
