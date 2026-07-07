// @/app/ingredients/IngredientsTabs.tsx
"use client";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";
import IngredienstList from "./list/IngredienstList";

import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IIngredientCategory } from "@/lib/enumslist/ingredient.constants";
import { IIngredient } from "@/lib/prisma.args";
import { INGREDIENT_SORT_OPTIONS } from "@/lib/sorting.ingredients";
import { useIngredientFiltersStore } from "@/zustand/ingredient.filter.store";

// Reusable Layout and Badge Elements
import { AdminCategoryButtons } from "@/components/admin-cat-buttons/AdminCategoryButtons";
import {
  ActiveFilterBadges,
  IActiveBadge,
} from "@/components/filter-layout/ActiveFilterBadges";
import { FilterLayout } from "@/components/filter-layout/FilterLayout";

interface Props {
  ingredients: IIngredient[];
}

const IngredientsTabs = ({ ingredients }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  // Extract Zustand state management fields
  const { category, stock, sort, setCategory, setStock, setSort, reset } =
    useIngredientFiltersStore();

  const filteredIngredients = useIngredientsFilter({
    ingredients,
    searchQuery: searchQuery.trim(),
    sort,
    stock,
    category,
  });

  const initialCategory: IIngredientCategory =
    category === "all" ? "SPICES" : category;

  // Build the array of active badges matching your exact configuration structural schemas
  const activeBadges = useMemo(() => {
    const list: IActiveBadge[] = [];

    if (category && category !== "all") {
      const option = FILTER_CONFIGS.ingredients.category.options.find(
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
      const option = FILTER_CONFIGS.ingredients.stock.options.find(
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
  }, [category, stock, setCategory, setStock]);

  // Unified reset logic to handle the "Очистити все" button
  const handleClearAll = () => {
    setCategory("all");
    setStock("all");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2">
        <h1>Ingredients</h1>
        <IngredientFormsDialog initialCategory={initialCategory} />
      </div>
      <Separator className="mb-2" />

      <AdminCategoryButtons
        onChange={setCategory}
        value={category}
        config={FILTER_CONFIGS.ingredients.category}
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
            onClearAll={handleClearAll}
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

export default IngredientsTabs;
