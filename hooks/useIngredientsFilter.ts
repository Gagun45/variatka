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

    let result = ingredients;

    // 1. CATEGORY (base scope)
    if (category !== "all") {
      result = result.filter((i) => i.category === category);
    }

    // 2. SEARCH (inside category scope)
    if (query.length > 0) {
      result = result.filter((i) => i.title.toLowerCase().includes(query));
    }

    // 3. STOCK
    if (stock === "in") {
      result = result.filter((i) => i.isInStock);
    } else if (stock === "out") {
      result = result.filter((i) => !i.isInStock);
    }

    // 4. SORT
    return [...result].sort(INGREDIENT_SORTERS[sort]);
  }, [ingredients, searchQuery, category, stock, sort]);
}
