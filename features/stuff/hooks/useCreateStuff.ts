import { IStuff } from "@/lib/prisma.args";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useCreateStuff = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IStuff, Error, ICreateStuffDto>({
    mutationFn: stuffService.create,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: stuffKeys.stuff });
    },
  });
  return mutation;
};
