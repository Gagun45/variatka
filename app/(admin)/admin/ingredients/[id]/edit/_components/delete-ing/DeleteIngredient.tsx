import DeleteDialog from "@/components/delete-dialog/DeleteDialog";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useDeleteIngredient } from "@/features/ingredient/hooks/useDeleteIngredient";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

const DeleteIngredient = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();
  const { mutate, isPending } = useDeleteIngredient();
  const router = useRouter();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;

  const alertTitle = "Delete ingredient?";
  const alertDescription =
    "This action cannot be undone. If this ingredient is used in recipes, the deletion will be blocked";
  const isUsedInRecipes = recipes.some((r) =>
    r.ingredients.some((i) => i.ingredientId === id),
  );
  const isDisabled = isUsedInRecipes;
  const label = isDisabled ? "Cannot be deleted" : "Delete ingredient";
  const onDelete = () => {
    mutate(id, {
      onSuccess: () => {
        router.push(frontendUrls.ingredients.index);
      },
    });
  };
  return (
    <DeleteDialog
      alertTitle={alertTitle}
      alertDescription={alertDescription}
      label={label}
      onDelete={onDelete}
      isPending={isPending}
      isDisabled={isDisabled}
    />
  );
};

export default DeleteIngredient;
