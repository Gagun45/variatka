import { IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffCategoryDto } from "@/zod/stuff.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";
import { toast } from "sonner";

export const useCreateStuffCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IStuffCategory, Error, ICreateStuffCategoryDto>({
    mutationFn: stuffService.createCategory,
    onSuccess: (newStuffCategory) => {
      qclient.setQueryData<IStuffCategory[]>(
        stuffKeys.categories,
        (old = []) => [newStuffCategory, ...old],
      );
      toast.success("Category created successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
