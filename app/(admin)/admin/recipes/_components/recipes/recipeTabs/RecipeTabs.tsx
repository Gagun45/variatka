"use client";

import { IRecipe } from "@/lib/prisma.args";
import { useState } from "react";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import { IConfirmedType } from "@/lib/constants/confirmed.optionts";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";

import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useSearchParams } from "next/navigation";
import RecipesList from "./recipes-list/RecipesList";

interface Props {
  recipes: IRecipe[];
}

const RecipeTabs = ({ recipes }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  // ✅ category is now id-based + supports "all"
  const [categoryFilter, setCategoryFilter] =
    useState<IRecipeCategoryFilter>("all");

  const [stockFilter, setStockFilter] = useState<IStockType>("all");
  const [readyFilter, setReadyFilter] = useState<IReadyToMakeType>("all");
  const [confirmedFilter, setConfirmedFilter] = useState<IConfirmedType>("all");
  const [series, setSeries] = useState<IRecipeSeriesFilter>("all");

  const [sort, setSort] = useState<IRecipeSortType>("newest");

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    category: categoryFilter,
    stock: stockFilter,
    sort,
    readyToMake: readyFilter,
    confirmed: confirmedFilter,
    series,
  });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* CATEGORY ROW */}

      <Separator />

      {/* FILTERS */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-4">
          <FilterButtons
            value={categoryFilter}
            onChange={setCategoryFilter}
            config={FILTER_CONFIGS.recipes.category}
          />

          <FilterButtons
            value={stockFilter}
            onChange={setStockFilter}
            config={FILTER_CONFIGS.recipes.stock}
          />

          <FilterButtons
            value={readyFilter}
            onChange={setReadyFilter}
            config={FILTER_CONFIGS.recipes.ready}
          />

          <FilterButtons
            value={series}
            onChange={setSeries}
            config={FILTER_CONFIGS.recipes.series}
          />

          <FilterButtons
            value={confirmedFilter}
            onChange={setConfirmedFilter}
            config={FILTER_CONFIGS.recipes.confirmed}
          />
        </div>

        <div className="mt-auto ml-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={RECIPE_SORT_OPTIONS}
          />
        </div>
      </div>

      {/* RESULTS */}
      {filteredRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim()
            ? `No recipes found for "${searchQuery}"`
            : "Found 0 recipes"}
        </p>
      ) : (
        <>
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              {filteredRecipes.length} recipes include{" "}
              <span className="italic">&quot;{searchQuery}&quot;</span>
            </p>
          )}

          <RecipesList recipes={filteredRecipes} />
        </>
      )}
    </div>
  );
};

export default RecipeTabs;
