"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { Bookmark } from "lucide-react";
import SavedIngredientsTabs from "./tabs/SavedIngredientsTabs";

const SavedIngredients = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();
  if (isLoading) return <Loader />;
  if (isError || !ingredients)
    return (
      <StateScreen
        title="We couldn't load the saved ingredients"
        description="Please refresh the page and try again."
      />
    );
  const savedIngredients = ingredients.filter((i) => i.isSaved);
  if (savedIngredients.length === 0)
    return (
      <StateScreen
        title="No saved ingredients yet"
        description="Ingredients you save will appear here."
        icon={<Bookmark />}
      />
    );

  return <SavedIngredientsTabs ingredients={savedIngredients} />;
};

export default SavedIngredients;
