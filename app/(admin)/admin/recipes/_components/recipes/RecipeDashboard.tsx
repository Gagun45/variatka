"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import RecipeTabs from "./recipeTabs/RecipeTabs";

const RecipeDashboard = () => {
  const { data: recipes, isLoading, isError } = useRecipes();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipes) {
    return <StateScreen />;
  }

  return <RecipeTabs recipes={recipes} />;
};

export default RecipeDashboard;
