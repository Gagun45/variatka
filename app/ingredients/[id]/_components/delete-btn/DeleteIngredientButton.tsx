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
import { frontendUrls } from "@/lib/urls";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  id: number;
}

const DeleteIngredientButton = ({ id }: Props) => {
  const { mutate, isPending } = useDeleteIngredient();
  const router = useRouter();

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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full py-8 text-2xl items-center gap-4"
          variant="destructive"
        >
          <TrashIcon className="size-7" />
          Delete ingredient
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
