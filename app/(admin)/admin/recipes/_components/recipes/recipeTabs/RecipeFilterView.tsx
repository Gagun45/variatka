"use client";

import { AdminCategoryButtons } from "@/components/admin-cat-buttons/AdminCategoryButtons";
import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import { ActiveFilterBadges } from "@/components/filter-layout/ActiveFilterBadges";
import {
  createActiveFilterBadges,
  type FilterDefinition,
  resetFilterDefinitions,
} from "@/components/filter-layout/filterDefinitions";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { IConfirmedType } from "@/lib/constants/confirmed.optionts";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";
import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IRecipeHiddenFilter } from "@/lib/enumslist/hidden.constants";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import { useSearchParams } from "next/navigation";
import RecipesList from "./recipes-list/RecipesList";

type RecipeFilterValues = {
  category: IRecipeCategoryFilter;
  stock: IStockType;
  ready: IReadyToMakeType;
  confirmed: IConfirmedType;
  series: IRecipeSeriesFilter;
  hidden: IRecipeHiddenFilter;
  sort: IRecipeSortType;
};

type RecipeFilterActions = {
  setCategory: (value: IRecipeCategoryFilter) => void;
  setStock: (value: IStockType) => void;
  setReady: (value: IReadyToMakeType) => void;
  setConfirmed: (value: IConfirmedType) => void;
  setSeries: (value: IRecipeSeriesFilter) => void;
  setHidden: (value: IRecipeHiddenFilter) => void;
  setSort: (value: IRecipeSortType) => void;
};

type Props = {
  title: string;
  recipes: IRecipe[];
  filters: RecipeFilterValues & RecipeFilterActions;
};

const RecipeFilterView = ({ title, recipes, filters }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const {
    category,
    stock,
    ready,
    confirmed,
    series,
    hidden,
    sort,
    setCategory,
    setStock,
    setReady,
    setConfirmed,
    setSeries,
    setHidden,
    setSort,
  } = filters;

  const filterDefinitions: FilterDefinition[] = [
    {
      id: "category",
      value: category,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.category.options,
      reset: () => setCategory("all"),
    },
    {
      id: "stock",
      value: stock,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.stock.options,
      reset: () => setStock("all"),
    },
    {
      id: "readyToMake",
      value: ready,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.ready.options,
      reset: () => setReady("all"),
    },
    {
      id: "series",
      value: series,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.series.options,
      reset: () => setSeries("all"),
    },
    {
      id: "confirmed",
      value: confirmed,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.confirmed.options,
      reset: () => setConfirmed("all"),
    },
    {
      id: "hidden",
      value: hidden,
      defaultValue: "visible",
      options: FILTER_CONFIGS.recipes.hidden.options,
      labelPrefix: "Visibility",
      reset: () => setHidden("visible"),
    },
  ];
  const activeBadges = createActiveFilterBadges(filterDefinitions);
  const resetActiveFilters = () => resetFilterDefinitions(filterDefinitions);

  const filteredRecipes = useRecipesFilter({
    recipes,
    searchQuery,
    hidden,
    category,
    stock,
    sort,
    readyToMake: ready,
    confirmed,
    series,
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <h1>{title}</h1>
      </div>
      <Separator className="mb-2" />
      <AdminCategoryButtons
        config={FILTER_CONFIGS.recipes.category}
        value={category}
        onChange={setCategory}
      />

      <FilterLayout
        onReset={resetActiveFilters}
        activeFilterCount={activeBadges.length}
        sort={
          <SortSelect
            value={sort}
            onChange={setSort}
            options={RECIPE_SORT_OPTIONS}
          />
        }
        results={
          <ResultsFoundText
            amount={filteredRecipes.length}
            searchQuery={searchQuery}
          />
        }
        activeFilters={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={resetActiveFilters}
          />
        }
        content={<RecipesList recipes={filteredRecipes} />}
        filters={
          <>
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

            <FilterButtons
              value={hidden}
              onChange={setHidden}
              config={FILTER_CONFIGS.recipes.hidden}
            />
          </>
        }
      />
    </div>
  );
};

export default RecipeFilterView;
