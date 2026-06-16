"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredienstList from "../../_components/dashboard/tabs/list/IngredienstList";

const MyList = () => {
  const { data: ingredients, isLoading, isError } = useIngredients();
  if (isLoading) return <Loader />;
  if (isError || !ingredients)
    return <StateScreen title="Something went wrong" />;
  const myIngredients = ingredients.filter((i) => i.isAdded);
  if (myIngredients.length === 0)
    return <p className="text-center">No ingredients added yet</p>;
  return <IngredienstList ingredients={myIngredients} />;
};

export default MyList;
