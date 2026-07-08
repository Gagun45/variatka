// @/app/recipes/RecipeTabs.tsx
"use client";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";

import { useRecipesFilter } from "@/hooks/useRecipesFilter";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IRecipe } from "@/lib/prisma.args";
import { RECIPE_SORT_OPTIONS } from "@/lib/sorting.recipes";

// Reusable Components
import {
  ActiveFilterBadges,
  IActiveBadge,
} from "@/components/filter-layout/ActiveFilterBadges";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";
import { useSavedRecipeFiltersStore } from "@/zustand/recipe.saved.filters.store";
import { useSearchParams } from "next/navigation";
import RecipesList from "../../../_components/recipes/recipeTabs/recipes-list/RecipesList";
import { AdminCategoryButtons } from "@/components/admin-cat-buttons/AdminCategoryButtons";

interface Props {
  recipes: IRecipe[];
}

const SavedRecipesTabs = ({ recipes }: Props) => {
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
    reset,
  } = useSavedRecipeFiltersStore();

  // Build the array of active badges including matching configuration structural properties
  const activeBadges = useMemo(() => {
    const list: IActiveBadge[] = [];

    if (category && category !== "all") {
      const option = FILTER_CONFIGS.recipes.category.options.find(
        (o) => o.value === category,
      );
      if (option) {
        list.push({
          id: "category",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setCategory("all"),
        });
      }
    }

    if (stock && stock !== "all") {
      const option = FILTER_CONFIGS.recipes.stock.options.find(
        (o) => o.value === stock,
      );
      if (option) {
        list.push({
          id: "stock",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setStock("all"),
        });
      }
    }

    if (ready && ready !== "all") {
      const option = FILTER_CONFIGS.recipes.ready.options.find(
        (o) => o.value === ready,
      );
      if (option) {
        list.push({
          id: "readyToMake",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setReady("all"),
        });
      }
    }

    if (series && series !== "all") {
      const option = FILTER_CONFIGS.recipes.series.options.find(
        (o) => o.value === series,
      );
      if (option) {
        list.push({
          id: "series",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setSeries("all"),
        });
      }
    }

    if (confirmed && confirmed !== "all") {
      const option = FILTER_CONFIGS.recipes.confirmed.options.find(
        (o) => o.value === confirmed,
      );
      if (option) {
        list.push({
          id: "confirmed",
          label: option.label,
          icon: option.icon,
          iconClassName: option.iconClassName,
          onClear: () => setConfirmed("all"),
        });
      }
    }

    return list;
  }, [
    category,
    stock,
    ready,
    series,
    confirmed,
    setCategory,
    setStock,
    setReady,
    setSeries,
    setConfirmed,
  ]);

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
    <div className="w-fulls">
      <div className="flex justify-center items-center gap-2">
        <h1>Saved recipes</h1>
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
      </FilterLayout>
    </div>
  );
};

export default SavedRecipesTabs;
