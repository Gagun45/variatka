import DeleteDialog from "@/components/delete-dialog/DeleteDialog";
import { useDeleteStuff } from "@/features/stuff/hooks/useDeleteStuff";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

const DeleteStuff = ({ id }: Props) => {
  const { mutate, isPending } = useDeleteStuff();
  const router = useRouter();
  const label = "Delete stuff";
  const alertTitle = "Delete stuff?";
  const alertDescription = "This action cannot be undone.";
  const onDelete = () => {
    mutate(id, {
      onSuccess: () => {
        router.push(frontendUrls.stuff.index);
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

export default DeleteStuff;
