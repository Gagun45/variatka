import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useDeleteStuff = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<number, Error, number>({
    mutationFn: stuffService.delete,

    onSuccess: () => {
      toast.success("Stuff deleted!");
      queryClient.invalidateQueries({ queryKey: stuffKeys.stuff });
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
