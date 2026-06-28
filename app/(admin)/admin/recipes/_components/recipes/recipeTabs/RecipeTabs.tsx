"use client";

import { IRecipe } from "@/lib/prisma.args";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";

import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useRecipeFiltersStore } from "@/zustand/recipe.filter.store";
import { useSearchParams } from "next/navigation";
import RecipesList from "./recipes-list/RecipesList";

interface Props {
  recipes: IRecipe[];
}

const RecipeTabs = ({ recipes }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const {
    category,
    stock,
    ready,
    confirmed,
    series,
    sort,
    setCategory,
    setStock,
    setReady,
    setConfirmed,
    setSeries,
    setSort,
  } = useRecipeFiltersStore();

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    category,
    stock,
    sort,
    readyToMake: ready,
    confirmed,
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
            value={category}
            onChange={setCategory}
            config={FILTER_CONFIGS.recipes.category}
          />

          <FilterButtons
            value={stock}
            onChange={setStock}
            config={FILTER_CONFIGS.recipes.stock}
          />

          <FilterButtons
            value={ready}
            onChange={setReady}
            config={FILTER_CONFIGS.recipes.ready}
          />

          <FilterButtons
            value={series}
            onChange={setSeries}
            config={FILTER_CONFIGS.recipes.series}
          />

          <FilterButtons
            value={confirmed}
            onChange={setConfirmed}
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

      <ResultsFoundText
        amount={filteredRecipes.length}
        searchQuery={searchQuery}
      />

      <RecipesList recipes={filteredRecipes} />
    </div>
  );
};

export default RecipeTabs;
