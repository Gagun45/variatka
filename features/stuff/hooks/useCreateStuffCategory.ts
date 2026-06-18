import { IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffCategoryDto } from "@/zod/stuff.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useCreateStuffCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IStuffCategory, Error, ICreateStuffCategoryDto>({
    mutationFn: stuffService.createCategory,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: stuffKeys.categories });
    },
  });
  return mutation;
};
