"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredienstList from "../../_components/dashboard/tabs/list/IngredienstList";

const SavedIngredients = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();
  if (isLoading) return <Loader />;
  if (isError || !ingredients)
    return <StateScreen title="Something went wrong" />;
  const savedIngredients = ingredients.filter((i) => i.isSaved);
  if (savedIngredients.length === 0)
    return <p className="text-center">No ingredients added yet</p>;
  return (
    <>
      <p>{savedIngredients.length} ingredients</p>
      <IngredienstList ingredients={savedIngredients} />
    </>
  );
};

export default SavedIngredients;
