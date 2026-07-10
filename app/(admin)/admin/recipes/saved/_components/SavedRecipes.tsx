"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Button } from "@/components/ui/button";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import SavedRecipesTabs from "./tabs/SavedRecipesTabs";

const SavedRecipes = () => {
  const { data: recipes, isLoading, isError } = useRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes)
    return (
      <StateScreen
        title="We couldn't load the saved recipes"
        description="Please refresh the page and try again."
      />
    );
  const savedRecipes = recipes.filter((i) => i.isSaved);
  if (savedRecipes.length === 0)
    return (
      <StateScreen
        title="No saved recipes yet"
        description="Recipes you save will appear here."
        icon={<Bookmark />}
        action={
          <Button asChild>
            <Link href={frontendUrls.recipes.index}>Browse recipes</Link>
          </Button>
        }
      />
    );

  return <SavedRecipesTabs recipes={savedRecipes} />;
};

export default SavedRecipes;
