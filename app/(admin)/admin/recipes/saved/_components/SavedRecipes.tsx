"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import RecipesList from "../../_components/recipes/recipeTabs/recipes-list/RecipesList";
import { useState } from "react";
import {
  IRecipeSortType,
  RECIPE_SORT_OPTIONS,
  RECIPE_SORTERS,
} from "@/lib/sorting.recipes";
import { SortSelect } from "@/components/sort-select/SortSelect";

const SavedRecipes = () => {
  const { data: recipes, isLoading, isError } = useRecipes();
  const [sort, setSort] = useState<IRecipeSortType>("missing-asc");
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  const savedRecipes = recipes.filter((i) => i.isSaved);
  if (savedRecipes.length === 0)
    return <p className="text-center">No recipes saved yet</p>;
  const sortedRecipes = savedRecipes.sort(RECIPE_SORTERS[sort]);
  return (
    <>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p>{savedRecipes.length} recipes</p>
        <SortSelect
          onChange={setSort}
          value={sort}
          options={RECIPE_SORT_OPTIONS}
        />
      </div>
      <RecipesList recipes={sortedRecipes} />
    </>
  );
};

export default SavedRecipes;
