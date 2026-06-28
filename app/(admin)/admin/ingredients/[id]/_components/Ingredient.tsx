"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Separator } from "@/components/ui/separator";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredientRecipes from "./recipes/IngredientRecipes";
import IngredientView from "./view/IngredientView";

interface Props {
  id: number;
}

const Ingredient = ({ id }: Props) => {
  const { data: ingredients, isLoading, isError } = useIngredients();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !ingredients) {
    return <StateScreen />;
  }
  const ingredient = ingredients.find((ing) => ing.id === id);
  if (!ingredient) return <StateScreen title="Ingredient not found" />;
  return (
    <>
      <h1>{ingredient.title}</h1>
      <IngredientView ingredient={ingredient} />
      <Separator />
      <IngredientRecipes id={id} />
    </>
  );
};

export default Ingredient;
