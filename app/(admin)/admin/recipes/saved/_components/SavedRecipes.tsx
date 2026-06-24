"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import RecipesList from "../../_components/recipes/recipeTabs/recipes-list/RecipesList";

const SavedRecipes = () => {
  const { data: recipes, isLoading, isError } = useRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  const savedRecipes = recipes.filter((i) => i.isSaved);
  if (savedRecipes.length === 0)
    return <p className="text-center">No recipes saved yet</p>;
  return (
    <>
      <p>{savedRecipes.length} recipes</p>
      <RecipesList recipes={savedRecipes} />
    </>
  );
};

export default SavedRecipes;
