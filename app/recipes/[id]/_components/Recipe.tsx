"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipe } from "@/features/recipe/hooks/useRecipe";

interface Props {
  id: number;
}

const Recipe = ({ id }: Props) => {
  const { data: recipe, isLoading, isError } = useRecipe(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipe) {
    return (
      <StateScreen
        title="Couldn't load this recipe"
        description="Please try again in a moment."
      />
    );
  }
  return <div>Recipe = {recipe.id}</div>;
};

export default Recipe;
