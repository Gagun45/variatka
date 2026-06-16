"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useEditIngredient } from "@/features/ingredient/hooks/useEditIngredient";
import { useIngredient } from "@/features/ingredient/hooks/useIngredient";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import IngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { toast } from "sonner";
import DeleteIngredientButton from "../../_components/delete-btn/DeleteIngredientButton";
import { useRouter } from "next/navigation";

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
    data: ingredient,
    isLoading: isIngredientLoading,
    isError: isIngredientError,
  } = useIngredient(id);
  const { mutate, isPending } = useEditIngredient();
  if (isCategoriesLoading || isIngredientLoading) return <Loader />;
  if (isCategoriesError || !categories || isIngredientError || !ingredient)
    return <StateScreen title="Something went wrong" />;
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
