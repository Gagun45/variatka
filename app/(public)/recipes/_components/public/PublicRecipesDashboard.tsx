"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import PublicRecipesTabs from "./tabs/PublicRecipesTabs";

const PublicRecipesDashboard = () => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();

  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  return <PublicRecipesTabs recipes={recipes} />;
};

export default PublicRecipesDashboard;
