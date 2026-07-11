import { IStuff } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ICreateStuffDto } from "@/zod/stuff.schema";
import { toast } from "sonner";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useEditStuff = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    IStuff,
    Error,
    { id: number; dto: ICreateStuffDto }
  >({
    mutationFn: ({ dto, id }) => stuffService.edit(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stuffKeys.stuff });
      toast.success("Stuff edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
