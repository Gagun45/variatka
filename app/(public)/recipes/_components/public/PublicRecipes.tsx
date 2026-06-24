"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import PublicRecipesList from "./list/PublicRecipesList";

const PublicRecipes = () => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  return <PublicRecipesList recipes={recipes} />;
};

export default PublicRecipes;
