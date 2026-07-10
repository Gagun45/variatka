"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useEditIngredient } from "@/features/ingredient/hooks/useEditIngredient";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredientForm from "@/forms/add-ingredient/IngredientForm";
import { frontendUrls } from "@/lib/urls";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteIngredient from "./delete-ing/DeleteIngredient";

interface Props {
  id: number;
}

const IngredientEdit = ({ id }: Props) => {
  const router = useRouter();

  const { data: ingredients, isLoading, isError } = useIngredients();
  const { mutate, isPending } = useEditIngredient();
  if (isLoading) return <Loader />;
  if (isError || !ingredients)
    return (
      <StateScreen
        title="We couldn't load this ingredient"
        description="Please refresh the page and try again."
      />
    );
  const ingredient = ingredients.find((ing) => ing.id === id);
  if (!ingredient)
    return (
      <StateScreen
        title="Ingredient not found"
        description="It may have been removed or the link is incorrect."
        icon={<SearchX />}
      />
    );
  const onSubmit = (dto: IIngredientFormValues) => {
    mutate(
      {
        dto,
        id,
      },
      {
        onSuccess: () => {
          router.push(frontendUrls.ingredients.view(id));
        },
      },
    );
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1>Edit ingredient</h1>
        <IngredientForm
          isPending={isPending}
          onCreate={onSubmit}
          ingredient={ingredient}
        />
      </div>
      <DeleteIngredient id={id} />
    </div>
  );
};

export default IngredientEdit;
