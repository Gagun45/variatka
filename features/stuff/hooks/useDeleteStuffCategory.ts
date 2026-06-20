import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useDeleteStuffCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: stuffService.deleteCategory,

    onSuccess: () => {
      toast.success("Category deleted!");
      qclient.invalidateQueries({ queryKey: stuffKeys.categories });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
