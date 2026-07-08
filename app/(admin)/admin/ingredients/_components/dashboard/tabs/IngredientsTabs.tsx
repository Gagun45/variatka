"use client";

import { IIngredientCategory } from "@/lib/enumslist/ingredient.constants";
import { IIngredient } from "@/lib/prisma.args";
import { useIngredientFiltersStore } from "@/zustand/ingredient.filter.store";
import IngredientFormsDialog from "./forms-dialog/IngredientFormsDialog";
import IngredientFilterView from "./IngredientFilterView";

interface Props {
  ingredients: IIngredient[];
}

const IngredientsTabs = ({ ingredients }: Props) => {
  const filters = useIngredientFiltersStore();
  const initialCategory: IIngredientCategory =
    filters.category === "all" ? "SPICES" : filters.category;

  return (
    <IngredientFilterView
      title="Ingredients"
      ingredients={ingredients}
      filters={filters}
      headerAction={<IngredientFormsDialog initialCategory={initialCategory} />}
    />
  );
};

export default IngredientsTabs;
