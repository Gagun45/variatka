"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import RecipeView from "./view/RecipeView";
import Link from "next/link";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";

interface Props {
  id: number;
}

const Recipe = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !recipes) {
    return <StateScreen title="Something went wrong" />;
  }
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return <StateScreen title="Recipe not found" />;
  return (
    <>
      <RecipeView recipe={recipe} />
      <Link href={`/recipes/${id}/edit`}>Edit </Link>
    </>
  );
};

export default Recipe;
