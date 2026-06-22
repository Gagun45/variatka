import { useMemo } from "react";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORTERS } from "@/lib/sorting.recipes";
import { IStockType } from "@/lib/constants/stock.options";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";
import { IConfirmedType } from "@/lib/constants/confirmed.optionts";

export function useRecipesFilter({
  recipes,
  searchQuery,
  categoryId,
  stock,
  readyToMake,
  confirmed,
  sort,
}: {
  recipes: IRecipe[];
  searchQuery: string;
  categoryId?: number;
  stock: IStockType;
  readyToMake: IReadyToMakeType;
  confirmed: IConfirmedType;
  sort: IRecipeSortType;
}) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isSearching = query.length > 0;

    const base = isSearching
      ? recipes.filter((r) => r.title.toLowerCase().includes(query))
      : categoryId
        ? recipes.filter((r) => r.recipeCategoryId === categoryId)
        : recipes;

    const stockFiltered =
      stock === "in"
        ? base.filter((r) => r.inStock)
        : stock === "out"
          ? base.filter((r) => !r.inStock)
          : base;

    const readyFiltered = stockFiltered.filter((recipe) => {
      if (readyToMake === "all") return true;

      const isReadyToMake = !recipe.ingredients.some(
        (i) => !i.ingredient.isInStock,
      );

      return readyToMake === "ready" ? isReadyToMake : !isReadyToMake;
    });

    const confirmedFiltered = readyFiltered.filter((recipe) => {
      if (confirmed === "all") return true;

      return confirmed === "confirmed"
        ? recipe.isConfirmed
        : !recipe.isConfirmed;
    });

    return [...confirmedFiltered].sort(RECIPE_SORTERS[sort]);
  }, [recipes, searchQuery, categoryId, stock, readyToMake, sort, confirmed]);
}
