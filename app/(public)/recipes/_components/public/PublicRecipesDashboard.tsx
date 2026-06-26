"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import PublicRecipesTabs from "./tabs/PublicRecipesTabs";

const PublicRecipesDashboard = () => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useRecipeCategories();
  if (isLoading || isCategoriesLoading) return <Loader />;
  if (isError || !recipes || !categories || isCategoriesError)
    return <StateScreen />;
  return <PublicRecipesTabs categories={categories} recipes={recipes} />;
};

export default PublicRecipesDashboard;
