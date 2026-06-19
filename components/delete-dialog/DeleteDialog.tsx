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
import { TrashIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  isDisabled: boolean;
  isPending: boolean;
  label: string;
  alertTitle: string;
  alertDescription: string;
  onDelete: () => void;
}

const DeleteDialog = ({
  isDisabled,
  label,
  isPending,
  alertDescription,
  alertTitle,
  onDelete,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full py-8 text-lg sm:text-2xl items-center gap-4"
          variant="destructive"
          disabled={isDisabled}
        >
          <TrashIcon className="size-4 md:size-7" />
          {label}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-between!">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction asChild>
            <LoadingButton
              isPending={isPending}
              onClick={onDelete}
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

export default DeleteDialog;
