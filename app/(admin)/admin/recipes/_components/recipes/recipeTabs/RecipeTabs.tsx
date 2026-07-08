"use client";

import { IRecipe } from "@/lib/prisma.args";
import { useRecipeFiltersStore } from "@/zustand/recipe.filters.store";
import RecipeFilterView from "./RecipeFilterView";

interface Props {
  recipes: IRecipe[];
}

const RecipeTabs = ({ recipes }: Props) => {
  const filters = useRecipeFiltersStore();

  return (
    <RecipeFilterView title="Recipes" recipes={recipes} filters={filters} />
  );
};

export default RecipeTabs;
