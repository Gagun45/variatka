"use client";

import NewCategoryForm from "@/forms/add-ing-category/NewIngredientCategoryForm";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import IngredientsTabs from "./tabs/IngredientsTabs";
import { useCreateIngredientCategory } from "@/features/ingredient/hooks/useCreateIngredientCategory";
import { ICreateIngredientCategoryDto } from "@/zod/ingredient.schema";

const IngredientsDashboard = () => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useIngredientCategories();

  const {
    data: ingredients,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
  } = useIngredients();

  const { mutate, isPending } = useCreateIngredientCategory();
  const onCreateCategory = (dto: ICreateIngredientCategoryDto) => {
    mutate(dto);
  };

  if (isCategoriesLoading || isIngredientsLoading) {
    return <Loader />;
  }

  if (isCategoriesError || isIngredientsError || !categories || !ingredients) {
    return <StateScreen title="Something went wrong" />;
  }
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h1>No categories yet</h1>
        <p>Create your first category to get started.</p>
        <NewCategoryForm isPending={isPending} onCreate={onCreateCategory} />
      </div>
    );
  }
  return <IngredientsTabs categories={categories} ingredients={ingredients} />;
};

export default IngredientsDashboard;
