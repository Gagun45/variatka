import { IStuff } from "@/lib/prisma.args";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";
import { toast } from "sonner";

export const useCreateStuff = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IStuff, Error, ICreateStuffDto>({
    mutationFn: stuffService.create,

    onSuccess: (newStuff) => {
      queryClient.setQueryData<IStuff[]>(stuffKeys.stuff, (old = []) => [
        newStuff,
        ...old,
      ]);
      toast.success("Stuff created!");
    },

    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
