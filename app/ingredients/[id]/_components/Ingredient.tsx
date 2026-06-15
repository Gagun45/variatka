"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useEditIngredient } from "@/features/ingredient/hooks/useEditIngredient";
import { useIngredient } from "@/features/ingredient/hooks/useIngredient";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import IngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientFormValues } from "@/zod/ingredient.schema";

interface Props {
  id: number;
}

const Ingredient = ({ id }: Props) => {
  const { data: categories } = useIngredientCategories();
  const { data: ingredient, isLoading, isError } = useIngredient(id);
  const { mutate, isPending } = useEditIngredient();
  const onSubmit = (dto: IIngredientFormValues) => {
    mutate({
      dto,
      id,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !ingredient || !categories) {
    return (
      <StateScreen
        title="Couldn't load this ingredient"
        description="Please try again in a moment."
      />
    );
  }
  return (
    <IngredientForm
      isPending={isPending}
      onClick={onSubmit}
      ingredient={ingredient}
      categories={categories}
    />
  );
};

export default Ingredient;
