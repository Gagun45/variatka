"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import RecipesAccordion from "./accordion/RecipesAccordion";

const Recipes = () => {
  const { data: recipes, isLoading, isError } = useRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen title="Something went wrong" />;
  if (recipes.length === 0)
    return <p className="text-center">No recipes added yet</p>;

  return <RecipesAccordion recipes={recipes} />;
};

export default Recipes;
