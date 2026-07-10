// @/app/public-recipes/PublicRecipesTabs.tsx
"use client";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import PublicRecipesList from "../list/PublicRecipesList";

import { usePublicRecipeFilters } from "@/hooks/filtering/public-recipes/usePublicRecipeFilters";
import { usePublicRecipesFilter } from "@/hooks/usePublicRecipesFilter";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { PUBLIC_RECIPE_SORT_OPTIONS } from "@/lib/public.sorting.recipes";
import { IPublicRecipe } from "@/lib/types";

// Import your brand new reusable framework layout
import { CategoryNavigation } from "@/components/cat-navigation/CategoryNavigation";
import {
  ActiveFilterBadges,
  IActiveBadge,
} from "@/components/filter-layout/ActiveFilterBadges";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";
import { useMemo } from "react";
import { RECIPE_CATEGORIES_DATA } from "@/lib/enumslist/recipe.constants";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesTabs = ({ recipes }: Props) => {
  const { query, setCategory, setSeries, setSort, setStock, resetQuery } =
    usePublicRecipeFilters();
  const { category, searchQuery, series, sort, stock } = query;

  const activeBadges = useMemo(() => {
    const list: IActiveBadge[] = [];

    if (category && category !== "all") {
      const option = FILTER_CONFIGS.publicRecipes.category.options.find(
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

    return list;
  }, [category, series, stock, setCategory, setSeries, setStock]);

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

  return (
    <div className="w-full">
      <h1>
        {category === "all"
          ? "Вся продукція"
          : RECIPE_CATEGORIES_DATA[category].label}
      </h1>
      <CategoryNavigation
        onCategoryReset={onCategoryReset}
        value={category}
        onChange={setCategory}
        config={FILTER_CONFIGS.publicRecipes.category}
      />
      <Separator className="mb-4" />

      <FilterLayout
        onReset={resetQuery}
        activeFilterCount={activeBadges.length}
        activeFilters={
          <ActiveFilterBadges badges={activeBadges} onClearAll={resetQuery} />
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
        content={<PublicRecipesList recipes={filteredRecipes} />}
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
