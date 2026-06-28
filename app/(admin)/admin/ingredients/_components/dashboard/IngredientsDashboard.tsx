"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredientsTabs from "./tabs/IngredientsTabs";

const IngredientsDashboard = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !ingredients) {
    return <StateScreen />;
  }

  return <IngredientsTabs ingredients={ingredients} />;
};

export default IngredientsDashboard;
