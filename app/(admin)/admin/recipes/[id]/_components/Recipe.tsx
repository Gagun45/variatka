"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { SearchX } from "lucide-react";
import RecipeView from "./view/RecipeView";

interface Props {
  id: number;
}

const Recipe = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipes) {
    return (
      <StateScreen
        title="We couldn't load this recipe"
        description="Please refresh the page and try again."
      />
    );
  }
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe)
    return (
      <StateScreen
        title="Recipe not found"
        description="It may have been removed or the link is incorrect."
        icon={<SearchX />}
      />
    );
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
