"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipe } from "@/features/recipe/hooks/usePublicRecipe";
import { SearchX } from "lucide-react";
import PublicRecipeView from "./public/view/PublicRecipeView";

interface Props {
  id: number;
}

const PublicRecipe = ({ id }: Props) => {
  const { data: recipe, isLoading, isError, error } = usePublicRecipe(id);

  if (isLoading) return <Loader />;

  if (isError) {
    const isNotFound = error.message === "Recipe not found";
    return (
      <StateScreen
        title={isNotFound ? "Recipe not found" : "We couldn't load this recipe"}
        description={
          isNotFound
            ? "It may have been removed or the link is incorrect."
            : "Please refresh the page and try again."
        }
        icon={isNotFound ? <SearchX /> : undefined}
      />
    );
  }

  if (!recipe) return null;
  return <PublicRecipeView recipe={recipe} />;
};

export default PublicRecipe;
