"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import RecipeView from "./view/RecipeView";
import Link from "next/link";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import { buttonVariants } from "@/components/ui/button";

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
      <Link
        className={buttonVariants({ className: "px-8 text-base!" })}
        href={frontendUrls.recipes.edit(id)}
      >
        Edit{" "}
      </Link>
    </>
  );
};

export default Recipe;
