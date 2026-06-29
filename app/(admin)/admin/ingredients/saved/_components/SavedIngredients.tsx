"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import SavedIngredientsTabs from "./tabs/SavedIngredientsTabs";

const SavedIngredients = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();
  if (isLoading) return <Loader />;
  if (isError || !ingredients) return <StateScreen />;
  const savedIngredients = ingredients.filter((i) => i.isSaved);
  if (savedIngredients.length === 0)
    return <StateScreen title="No saved ingredients yet" />;

  return <SavedIngredientsTabs ingredients={savedIngredients} />;
};

export default SavedIngredients;
