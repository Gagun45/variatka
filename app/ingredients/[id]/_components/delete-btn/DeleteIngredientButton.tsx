import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";

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

import { Button } from "@/components/ui/button";

import { useDeleteIngredient } from "@/features/ingredient/hooks/useDeleteIngredient";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { frontendUrls } from "@/lib/urls";

interface Props {
  id: number;
}

const DeleteIngredientButton = ({ id }: Props) => {
  const router = useRouter();
  const { data: recipes, isLoading, isError } = useRecipes();
  const { mutate, isPending } = useDeleteIngredient();

  const [open, setOpen] = useState(false);

  if (isLoading) return <Loader />;
  if (!recipes || isError) return <StateScreen />;

  const isUsedInRecipes = recipes.some((r) =>
    r.ingredients.some((i) => i.ingredientId === id),
  );

  const handleDelete = () => {
    if (isPending) return;

    mutate(id, {
      onSuccess: () => {
        setOpen(false);
        router.push(frontendUrls.ingredients.index);
      },
    });
  };

  const canInteract = !isPending && !isUsedInRecipes;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full py-8 text-lg sm:text-2xl items-center gap-4"
          variant="destructive"
          disabled={!canInteract}
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
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction asChild>
            <LoadingButton
              isPending={isPending}
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </LoadingButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteIngredientButton;
