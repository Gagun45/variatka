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
import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IIngredientCategoryFilter } from "@/lib/enumslist/ingredient.constants";
import { IFilterConfig } from "@/lib/enumslist/types";
import { IIngredient } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORT_OPTIONS,
} from "@/lib/sorting.ingredients";
import { useSearchParams } from "next/navigation";
import { ReactNode, useMemo } from "react";
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
  reset: () => void;
};

type Props = {
  title: string;
  ingredients: IIngredient[];
  filters: IngredientFilterValues & IngredientFilterActions;
  headerAction?: ReactNode;
};

function createActiveBadge<T extends string>({
  id,
  value,
  defaultValue,
  config,
  onClear,
}: {
  id: string;
  value: T;
  defaultValue: T;
  config: IFilterConfig<T>;
  onClear: () => void;
}): IActiveBadge | null {
  if (value === defaultValue) return null;

  const option = config.options.find((o) => o.value === value);
  if (!option) return null;

  return {
    id,
    label: option.label,
    icon: option.icon,
    iconClassName: option.iconClassName,
    onClear,
  };
}

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
    reset,
  } = filters;

  const filteredIngredients = useIngredientsFilter({
    ingredients,
    searchQuery: searchQuery.trim(),
    sort,
    stock,
    category,
  });

  const activeBadges = useMemo(() => {
    const badges = [
      createActiveBadge({
        id: "category",
        value: category,
        defaultValue: "all",
        config: FILTER_CONFIGS.ingredients.category,
        onClear: () => setCategory("all"),
      }),
      createActiveBadge({
        id: "stock",
        value: stock,
        defaultValue: "all",
        config: FILTER_CONFIGS.ingredients.stock,
        onClear: () => setStock("all"),
      }),
    ];

    return badges.filter((badge): badge is IActiveBadge => Boolean(badge));
  }, [category, stock, setCategory, setStock]);

  const clearActiveFilters = () => {
    setCategory("all");
    setStock("all");
  };

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
        onReset={reset}
        sortSlot={
          <SortSelect
            value={sort}
            onChange={setSort}
            options={INGREDIENT_SORT_OPTIONS}
          />
        }
        resultsSlot={
          <ResultsFoundText
            amount={filteredIngredients.length}
            searchQuery={searchQuery}
          />
        }
        badgesSlot={
          <ActiveFilterBadges
            badges={activeBadges}
            onClearAll={clearActiveFilters}
          />
        }
        listSlot={<IngredienstList ingredients={filteredIngredients} />}
      >
        <FilterButtons
          value={stock}
          onChange={setStock}
          config={FILTER_CONFIGS.ingredients.stock}
        />
      </FilterLayout>
    </div>
  );
};

export default IngredientFilterView;
