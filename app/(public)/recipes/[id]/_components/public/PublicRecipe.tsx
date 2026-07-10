"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import { SearchX } from "lucide-react";
import PublicRecipeView from "./view/PublicRecipeView";

interface Props {
  id: number;
}

const PublicRecipe = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes)
    return (
      <StateScreen
        title="We couldn't load this recipe"
        description="Please refresh the page and try again."
      />
    );
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe)
    return (
      <StateScreen
        title="Recipe not found"
        description="It may have been removed or the link is incorrect."
        icon={<SearchX />}
      />
    );

  return <PublicRecipeView recipe={recipe} />;
};

export default PublicRecipe;
