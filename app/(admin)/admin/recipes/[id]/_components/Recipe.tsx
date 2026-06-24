"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import RecipeView from "./view/RecipeView";
import SimilarRecipes from "./similar/SimilarRecipes";

interface Props {
  id: number;
}

const Recipe = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipes) {
    return <StateScreen />;
  }
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return <StateScreen title="Recipe not found" />;
  return (
    <div className="space-y-24">
      <div>
        <h1>{recipe.title}</h1>
        <RecipeView recipe={recipe} />
      </div>
      <SimilarRecipes allRecipes={recipes} recipe={recipe} />
    </div>
  );
};

export default Recipe;
