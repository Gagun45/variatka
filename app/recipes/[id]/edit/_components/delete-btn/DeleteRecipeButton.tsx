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
import { useDeleteRecipe } from "@/features/recipe/hooks/useDeleteRecipe";
import { frontendUrls } from "@/lib/urls";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  recipeId: number;
}

const DeleteRecipeButton = ({ recipeId }: Props) => {
  const { mutate, isPending } = useDeleteRecipe();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    if (isPending) return;

    mutate(recipeId, {
      onSuccess: () => {
        setOpen(false);
        router.push(frontendUrls.recipes.index);
      },
    });
  };

  const canInteract = !isPending;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full py-8 text-lg sm:text-2xl items-center gap-4"
          variant="destructive"
          disabled={!canInteract}
        >
          <TrashIcon className="size-4 md:size-7" />
          Delete recipe
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
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

export default DeleteRecipeButton;
