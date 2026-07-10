// @/app/public-recipes/PublicRecipesTabs.tsx
"use client";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import StateScreen from "@/components/state-screen/StateScreen";
import { Button } from "@/components/ui/button";
import PublicRecipesList from "../list/PublicRecipesList";

import { usePublicRecipeFilters } from "@/hooks/filtering/public-recipes/usePublicRecipeFilters";
import { usePublicRecipesFilter } from "@/hooks/usePublicRecipesFilter";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { PUBLIC_RECIPE_SORT_OPTIONS } from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";

// Import your brand new reusable framework layout
import { CategoryNavigation } from "@/components/cat-navigation/CategoryNavigation";
import { ActiveFilterBadges } from "@/components/filter-layout/ActiveFilterBadges";
import {
  createActiveFilterBadges,
  type FilterDefinition,
  resetFilterDefinitions,
} from "@/components/filter-layout/filterDefinitions";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";
import { PackageOpen, RotateCcw, SearchX } from "lucide-react";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesTabs = ({ recipes }: Props) => {
  const { query, setCategory, setSeries, setSort, setStock, resetQuery } =
    usePublicRecipeFilters();
  const { category, searchQuery, series, sort, stock } = query;

  const filterDefinitions: FilterDefinition[] = [
    {
      id: "series",
      value: series,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.series.options,
      reset: () => setSeries("all"),
    },
    {
      id: "stock",
      value: stock,
      defaultValue: "all",
      options: FILTER_CONFIGS.recipes.stock.options,
      reset: () => setStock("all"),
    },
  ];
  const activeBadges = createActiveFilterBadges(filterDefinitions);

  const filteredRecipes = usePublicRecipesFilter({
    recipes,
    searchQuery,
    category,
    stock,
    sort,
    series,
  });

  const onCategoryReset = () => {
    setCategory("all");
  };

  const resetActiveFilters = () => {
    resetFilterDefinitions(filterDefinitions);
  };

  const hasActiveCriteria =
    searchQuery.trim().length > 0 ||
    category !== "all" ||
    stock !== "all" ||
    series !== "all";

  const emptyResults = hasActiveCriteria ? (
    <StateScreen
      title="Нічого не знайдено"
      description={
        searchQuery.trim()
          ? `Не знайдено результатів для “${searchQuery.trim()}”. Спробуйте інший запит або змініть фільтри.`
          : "Спробуйте вибрати іншу категорію або змінити фільтри."
      }
      icon={<SearchX />}
      action={
        <Button onClick={resetQuery}>
          <RotateCcw />
          Скинути пошук і фільтри
        </Button>
      }
    />
  ) : (
    <StateScreen
      title="Продукції поки немає"
      description="Щойно з’являться доступні рецепти, вони відобразяться тут."
      icon={<PackageOpen />}
    />
  );

  return (
    <div className="w-full">
      <CategoryNavigation
        onCategoryReset={onCategoryReset}
        isResetActive={category === "all"}
        value={category}
        onChange={setCategory}
        config={FILTER_CONFIGS.publicRecipes.category}
      />

      <FilterLayout
        onReset={resetActiveFilters}
        activeFilterCount={activeBadges.length}
        activeFilters={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={resetActiveFilters}
          />
        }
        sort={
          <SortSelect
            value={sort}
            onChange={setSort}
            options={PUBLIC_RECIPE_SORT_OPTIONS}
          />
        }
        results={
          <ResultsFoundText
            amount={filteredRecipes.length}
            searchQuery={searchQuery}
          />
        }
        content={
          filteredRecipes.length > 0 ? (
            <PublicRecipesList recipes={filteredRecipes} />
          ) : (
            emptyResults
          )
        }
        filters={
          <>
            <FilterButtons
              value={stock}
              onChange={setStock}
              config={FILTER_CONFIGS.recipes.stock}
            />
            <FilterButtons
              value={series}
              onChange={setSeries}
              config={FILTER_CONFIGS.recipes.series}
            />
          </>
        }
      />
    </div>
  );
};

export default PublicRecipesTabs;
