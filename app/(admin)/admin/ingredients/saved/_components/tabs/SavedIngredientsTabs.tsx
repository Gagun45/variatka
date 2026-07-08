"use client";

import IngredientFilterView from "@/app/(admin)/admin/ingredients/_components/dashboard/tabs/IngredientFilterView";
import { IIngredient } from "@/lib/prisma.args";
import { useSavedIngredientFiltersStore } from "@/zustand/ingredient.saved.filter.store";

interface Props {
  ingredients: IIngredient[];
}

const SavedIngredientsTabs = ({ ingredients }: Props) => {
  const filters = useSavedIngredientFiltersStore();

  return (
    <IngredientFilterView
      title="Saved ingredients"
      ingredients={ingredients}
      filters={filters}
    />
  );
};

export default SavedIngredientsTabs;
