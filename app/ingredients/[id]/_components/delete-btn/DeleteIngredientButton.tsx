import Loader from "@/components/loader/Loader";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import StateScreen from "@/components/state-screen/StateScreen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { useDeleteIngredient } from "@/features/ingredient/hooks/useDeleteIngredient";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  id: number;
}

const DeleteIngredientButton = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();

  const { mutate, isPending } = useDeleteIngredient();
  const router = useRouter();
  if (isLoading) return <Loader />;
  if (!recipes || isError) return <StateScreen title="Something went wrong" />;

  const handleDelete = () => {
    mutate(id, {
      onSuccess: () => {
        toast.success("Ingredient deleted!");
        router.push(frontendUrls.ingredients.index);
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    });
  };

  const isUsedInRecipes = recipes.some((r) =>
    r.ingredients.some((i) => i.ingredientId === id),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isUsedInRecipes}>
        <Button
          className="w-full py-8 text-lg sm:text-2xl items-center gap-4"
          variant="destructive"
        >
          <TrashIcon className="size-4 md:size-7" />
          {isUsedInRecipes ? "Cannot be deleted" : "Delete ingredient"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete ingredient?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If this ingredient is used in recipes,
            the deletion will be blocked.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-between!">
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction asChild>
            <LoadingButton isPending={isPending} onClick={handleDelete}>
              Delete
            </LoadingButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteIngredientButton;
