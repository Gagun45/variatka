import DeleteDialog from "@/components/delete-dialog/DeleteDialog";
import { useDeleteRecipe } from "@/features/recipe/hooks/useDeleteRecipe";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

const DeleteRecipe = ({ id }: Props) => {
  const { mutate, isPending } = useDeleteRecipe();
  const router = useRouter();
  const label = "Delete recipe";
  const alertTitle = "Delete recipe?";
  const alertDescription = "This action cannot be undone.";
  const onDelete = () => {
    mutate(id, {
      onSuccess: () => {
        router.push(frontendUrls.recipes.index);
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
      isDisabled={false}
    />
  );
};

export default DeleteRecipe;
