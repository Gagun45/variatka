"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import PublicRecipeView from "./view/PublicRecipeView";

interface Props {
  id: number;
}

const PublicRecipe = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return <StateScreen title="Recipe not found" />;

  return <PublicRecipeView recipe={recipe} />;
};

export default PublicRecipe;
