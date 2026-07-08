"use client";

import RecipeFilterView from "@/app/(admin)/admin/recipes/_components/recipes/recipeTabs/RecipeFilterView";
import { IRecipe } from "@/lib/prisma.args";
import { useSavedRecipeFiltersStore } from "@/zustand/recipe.saved.filters.store";

interface Props {
  recipes: IRecipe[];
}

const SavedRecipesTabs = ({ recipes }: Props) => {
  const filters = useSavedRecipeFiltersStore();

  return (
    <RecipeFilterView
      title="Saved recipes"
      recipes={recipes}
      filters={filters}
    />
  );
};

export default SavedRecipesTabs;
