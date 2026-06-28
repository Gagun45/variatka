"use client";

import { Separator } from "@/components/ui/separator";
import { IIngredient } from "@/lib/prisma.args";
import { INGREDIENT_SORT_OPTIONS } from "@/lib/sorting.ingredients";

import { FilterButtons } from "@/components/filter-buttons/FilterButtons";
import ResultsFoundText from "@/components/results-found-p/ResultsFoundText";
import { SortSelect } from "@/components/sort-select/SortSelect";
import { useIngredientsFilter } from "@/hooks/useIngredientsFilter";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { IIngredientCategory } from "@/lib/enumslist/ingredient.constants";
import { useIngredientFiltersStore } from "@/zustand/ingredient.filter.store";
import { useSearchParams } from "next/navigation";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";
import IngredienstList from "./list/IngredienstList";

interface Props {
  ingredients: IIngredient[];
}

const IngredientsTabs = ({ ingredients }: Props) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? "";

  const { category, stock, sort, setCategory, setStock, setSort } =
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

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      <div className="flex flex-wrap gap-4 justify-center">
        <IngredientFormsDialog initialCategory={initialCategory} />
      </div>
      <Separator />
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-4">
          <FilterButtons
            variant="bigger"
            value={category}
            onChange={setCategory}
            config={FILTER_CONFIGS.ingredients.category}
          />
          <FilterButtons
            value={stock}
            onChange={setStock}
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
