"use client";

import { AdminCategoryButtons } from "@/components/admin-cat-buttons/AdminCategoryButtons";
import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import {
  ActiveFilterBadges,
  IActiveBadge,
} from "@/components/filter-layout/ActiveFilterBadges";
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
import { IFilterConfig } from "@/lib/enumslist/types";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeSortType, RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";
import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
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
  reset: () => void;
};

type Props = {
  title: string;
  recipes: IRecipe[];
  filters: RecipeFilterValues & RecipeFilterActions;
};

function createActiveBadge<T extends string>({
  id,
  value,
  defaultValue,
  config,
  onClear,
  labelPrefix,
}: {
  id: string;
  value: T;
  defaultValue: T;
  config: IFilterConfig<T>;
  onClear: () => void;
  labelPrefix?: string;
}): IActiveBadge | null {
  if (value === defaultValue) return null;

  const option = config.options.find((o) => o.value === value);
  if (!option) return null;

  return {
    id,
    label: labelPrefix ? `${labelPrefix}: ${option.label}` : option.label,
    icon: option.icon,
    iconClassName: option.iconClassName,
    onClear,
  };
}

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
    reset,
  } = filters;

  const activeBadges = useMemo(() => {
    const badges = [
      createActiveBadge({
        id: "category",
        value: category,
        defaultValue: "all",
        config: FILTER_CONFIGS.recipes.category,
        onClear: () => setCategory("all"),
      }),
      createActiveBadge({
        id: "stock",
        value: stock,
        defaultValue: "all",
        config: FILTER_CONFIGS.recipes.stock,
        onClear: () => setStock("all"),
      }),
      createActiveBadge({
        id: "readyToMake",
        value: ready,
        defaultValue: "all",
        config: FILTER_CONFIGS.recipes.ready,
        onClear: () => setReady("all"),
      }),
      createActiveBadge({
        id: "series",
        value: series,
        defaultValue: "all",
        config: FILTER_CONFIGS.recipes.series,
        onClear: () => setSeries("all"),
      }),
      createActiveBadge({
        id: "confirmed",
        value: confirmed,
        defaultValue: "all",
        config: FILTER_CONFIGS.recipes.confirmed,
        onClear: () => setConfirmed("all"),
      }),
      createActiveBadge({
        id: "hidden",
        value: hidden,
        defaultValue: "visible",
        config: FILTER_CONFIGS.recipes.hidden,
        labelPrefix: "Visibility",
        onClear: () => setHidden("visible"),
      }),
    ];

    return badges.filter((badge): badge is IActiveBadge => Boolean(badge));
  }, [
    category,
    stock,
    ready,
    series,
    confirmed,
    hidden,
    setCategory,
    setStock,
    setReady,
    setSeries,
    setConfirmed,
    setHidden,
  ]);

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
        onReset={reset}
        sortSlot={
          <SortSelect
            value={sort}
            onChange={setSort}
            options={RECIPE_SORT_OPTIONS}
          />
        }
        resultsSlot={
          <ResultsFoundText
            amount={filteredRecipes.length}
            searchQuery={searchQuery}
          />
        }
        badgesSlot={
          <ActiveFilterBadges badges={activeBadges} onClearAll={reset} />
        }
        listSlot={<RecipesList recipes={filteredRecipes} />}
      >
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
      </FilterLayout>
    </div>
  );
};

export default RecipeFilterView;
