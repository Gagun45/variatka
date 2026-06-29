import { IStockType } from "@/lib/constants/stock.options";
import { IIngredientCategoryFilter } from "@/lib/enumslist/ingredient.constants";
import { IIngredient } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORTERS,
} from "@/lib/sorting.ingredients";
import { useMemo } from "react";

export function useIngredientsFilter({
  ingredients,
  searchQuery,
  category,
  stock,
  sort,
}: {
  ingredients: IIngredient[];
  searchQuery: string;
  category: IIngredientCategoryFilter;
  stock: IStockType;
  sort: IIngredientSortType;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query.length > 0;

    // Search globally across all ingredients
    const base = isSearching
      ? ingredients.filter((i) => i.title.toLowerCase().includes(query))
      : category === "all"
        ? ingredients
        : ingredients.filter((i) => i.category === category);

    const stockFiltered =
      stock === "in"
        ? base.filter((i) => i.isInStock)
        : stock === "out"
          ? base.filter((i) => !i.isInStock)
          : base;

    return [...stockFiltered].sort(INGREDIENT_SORTERS[sort]);
  }, [ingredients, searchQuery, category, stock, sort]);
}
