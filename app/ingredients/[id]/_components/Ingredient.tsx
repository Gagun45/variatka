"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredient } from "@/features/ingredient/hooks/useIngredient";

interface Props {
  id: number;
}

const Ingredient = ({ id }: Props) => {
  const { data: order, isLoading, isError } = useIngredient(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !order) {
    return (
      <StateScreen
        title="Couldn't load this ingredient"
        description="Please try again in a moment."
      />
    );
  }
  return <div>Ingredient - {id}</div>;
};

export default Ingredient;
