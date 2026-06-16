"use client";

import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useEditIngredient } from "@/features/ingredient/hooks/useEditIngredient";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import IngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteIngredientButton from "../../_components/delete-btn/DeleteIngredientButton";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

interface Props {
  id: number;
}

const IngredientEdit = ({ id }: Props) => {
  const router = useRouter();
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useIngredientCategories();
  const {
    data: ingredients,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
  } = useIngredients();
  const { mutate, isPending } = useEditIngredient();
  if (isCategoriesLoading || isIngredientsLoading) return <Loader />;
  if (isCategoriesError || !categories || isIngredientsError || !ingredients)
    return <StateScreen title="Something went wrong" />;
  const ingredient = ingredients.find((ing) => ing.id === id);
  if (!ingredient) return <StateScreen title="Ingredient not found" />;
  const onSubmit = (dto: IIngredientFormValues) => {
    mutate(
      {
        dto,
        id,
      },
      {
        onSuccess: () => {
          router.push(`/ingredients/${id}`);
          toast.success("Ingredient edited successfully!");
        },
        onError: (e) => {
          toast.error(e.message);
        },
      },
    );
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-center text-4xl py-4">Edit ingredient</p>
        <IngredientForm
          isPending={isPending}
          categories={categories}
          onClick={onSubmit}
          ingredient={ingredient}
        />
      </div>
      <DeleteIngredientButton id={id} />
    </div>
  );
};

export default IngredientEdit;
