"use client";

import Loader from "@/components/loader/Loader";
import { SortSelect } from "@/components/sort-select/SortSelect";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import {
  IIngredientSortType,
  INGREDIENT_SORT_OPTIONS,
  INGREDIENT_SORTERS,
} from "@/lib/sorting.ingredients";
import { useState } from "react";
import IngredienstList from "../../_components/dashboard/tabs/list/IngredienstList";

const SavedIngredients = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();
  const [sort, setSort] = useState<IIngredientSortType>("usage-desc");
  if (isLoading) return <Loader />;
  if (isError || !ingredients) return <StateScreen />;
  const savedIngredients = ingredients.filter((i) => i.isSaved);
  if (savedIngredients.length === 0)
    return <StateScreen title="No ingredients added yet" />;
  const sortedIngredients = savedIngredients.sort(INGREDIENT_SORTERS[sort]);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p>{savedIngredients.length} ingredients</p>
        <SortSelect
          value={sort}
          onChange={setSort}
          options={INGREDIENT_SORT_OPTIONS}
        />
      </div>
      <IngredienstList ingredients={sortedIngredients} />
    </>
  );
};

export default SavedIngredients;
