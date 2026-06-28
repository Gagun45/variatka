"use client";

import { useState } from "react";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { usePublicRecipesFilter } from "@/hooks/usePublicRecipesFilter";

import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import {
  IPublicRecipeSortType,
  PUBLIC_RECIPE_SORT_OPTIONS,
} from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import PublicRecipesList from "../list/PublicRecipesList";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesTabs = ({ recipes }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const [categoryFilter, setCategoryFilter] =
    useState<IRecipeCategoryFilter>("all");

  const [stockFilter, setStockFilter] = useState<IStockType>("all");
  const [seriesFilter, setSeriesFilter] = useState<IRecipeSeriesFilter>("all");

  const [sort, setSort] = useState<IPublicRecipeSortType>("name-asc");

  const filteredRecipes = usePublicRecipesFilter({
    recipes,
    searchQuery,
    category: categoryFilter,
    stock: stockFilter,
    sort,
    series: seriesFilter,
  });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <Separator />

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <FilterButtons
            value={categoryFilter}
            onChange={setCategoryFilter}
            config={FILTER_CONFIGS.recipes.category}
          />
          <FilterButtons
            value={seriesFilter}
            onChange={setSeriesFilter}
            config={FILTER_CONFIGS.recipes.series}
          />
          <FilterButtons
            value={stockFilter}
            onChange={setStockFilter}
            config={FILTER_CONFIGS.recipes.stock}
          />
        </div>
        <div className="mt-auto ml-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={PUBLIC_RECIPE_SORT_OPTIONS}
          />
        </div>
      </div>
      {filteredRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim()
            ? `No recipes found for "${searchQuery}"`
            : "Found 0 ingredients"}
        </p>
      ) : (
        <>
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} recipes include{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span> in title
            </p>
          )}

          <PublicRecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default PublicRecipesTabs;
