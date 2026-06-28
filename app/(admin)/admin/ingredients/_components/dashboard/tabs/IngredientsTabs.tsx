"use client";

import { Separator } from "@/components/ui/separator";
import { IIngredient } from "@/lib/prisma.args";
import {
  IIngredientSortType,
  INGREDIENT_SORT_OPTIONS,
} from "@/lib/sorting.ingredients";
import { useState } from "react";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { IStockType } from "@/lib/constants/stock.options";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import {
  IIngredientCategory,
  IIngredientCategoryFilter,
} from "@/lib/enumslist/ingredient.constants";
import { useSearchParams } from "next/navigation";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";
import IngredienstList from "./list/IngredienstList";

interface Props {
  ingredients: IIngredient[];
}

const IngredientsTabs = ({ ingredients }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const [activeCategory, setActiveCategory] =
    useState<IIngredientCategoryFilter>("SPICES");

  const [stockFilter, setStockFilter] = useState<IStockType>("all");

  const [sort, setSort] = useState<IIngredientSortType>("usage-desc");

  const filteredIngredients = useIngredientsFilter({
    ingredients,
    searchQuery: searchQuery.trim(),
    sort,
    stock: stockFilter,
    category: activeCategory,
  });

  const initialCategory: IIngredientCategory =
    activeCategory === "all" ? "SPICES" : activeCategory;

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <div className="flex flex-wrap gap-4 justify-center">
        <IngredientFormsDialog activeCategory={initialCategory} />
      </div>
      <Separator />
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <FilterButtons
            value={activeCategory}
            onChange={setActiveCategory}
            config={FILTER_CONFIGS.ingredients.category}
          />
          <FilterButtons
            value={stockFilter}
            onChange={setStockFilter}
            config={FILTER_CONFIGS.ingredients.stock}
          />
        </div>
        <div className="mt-auto">
          <SortSelect
            value={sort}
            onChange={setSort}
            options={INGREDIENT_SORT_OPTIONS}
          />
        </div>
      </div>

      <ResultsFoundText
        amount={filteredIngredients.length}
        searchQuery={searchQuery}
      />

      <IngredienstList ingredients={filteredIngredients} />
    </div>
  );
};

export default IngredientsTabs;
