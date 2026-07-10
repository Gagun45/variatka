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
import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IIngredientCategoryFilter } from "@/lib/enumslist/ingredient.constants";
import { IIngredient } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORT_OPTIONS,
} from "@/lib/sorting.ingredients";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import IngredienstList from "./list/IngredienstList";

type IngredientFilterValues = {
  category: IIngredientCategoryFilter;
  stock: IStockType;
  sort: IIngredientSortType;
};

type IngredientFilterActions = {
  setCategory: (category: IIngredientCategoryFilter) => void;
  setStock: (stock: IStockType) => void;
  setSort: (sort: IIngredientSortType) => void;
};

type Props = {
  title: string;
  ingredients: IIngredient[];
  filters: IngredientFilterValues & IngredientFilterActions;
  headerAction?: ReactNode;
};

const IngredientFilterView = ({
  title,
  ingredients,
  filters,
  headerAction,
}: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const {
    category,
    stock,
    sort,
    setCategory,
    setStock,
    setSort,
  } = filters;

  const filteredIngredients = useIngredientsFilter({
    ingredients,
    searchQuery: searchQuery.trim(),
    sort,
    stock,
    category,
  });

  const filterDefinitions: FilterDefinition[] = [
    {
      id: "category",
      value: category,
      defaultValue: "all",
      options: FILTER_CONFIGS.ingredients.category.options,
      reset: () => setCategory("all"),
    },
    {
      id: "stock",
      value: stock,
      defaultValue: "all",
      options: FILTER_CONFIGS.ingredients.stock.options,
      reset: () => setStock("all"),
    },
  ];
  const activeBadges = createActiveFilterBadges(filterDefinitions);
  const resetActiveFilters = () => resetFilterDefinitions(filterDefinitions);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        <h1>{title}</h1>
        {headerAction}
      </div>
      <Separator className="mb-2" />

      <AdminCategoryButtons
        config={FILTER_CONFIGS.ingredients.category}
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
            options={INGREDIENT_SORT_OPTIONS}
          />
        }
        results={
          <ResultsFoundText
            amount={filteredIngredients.length}
            searchQuery={searchQuery}
          />
        }
        activeFilters={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={resetActiveFilters}
          />
        }
        content={<IngredienstList ingredients={filteredIngredients} />}
        filters={
          <FilterButtons
            value={stock}
            onChange={setStock}
            config={FILTER_CONFIGS.ingredients.stock}
          />
        }
      />
    </div>
  );
};

export default IngredientFilterView;
