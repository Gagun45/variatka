"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipe } from "@/features/recipe/hooks/useRecipe";
import RecipeView from "./view/RecipeView";

interface Props {
  id: number;
}

const Recipe = ({ id }: Props) => {
  const { data: recipe, isLoading, isError } = useRecipe(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipe) {
    return <StateScreen />;
  }
  if (!recipe) return <StateScreen title="Recipe not found" />;
  return (
    <div className="space-y-24">
      <div>
        <h1>{recipe.title}</h1>
        <RecipeView recipe={recipe} />
      </div>
      {/* <SimilarRecipes allRecipes={recipes} recipe={recipe} /> */}
    </div>
  );
};

export default Recipe;
