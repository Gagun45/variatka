import { IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffCategoryDto } from "@/zod/stuff.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { stuffService } from "../stuff.api";
import { stuffKeys } from "../stuff.keys";

export const useEditStuffCategory = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<
    IStuffCategory,
    Error,
    { id: number; dto: ICreateStuffCategoryDto }
  >({
    mutationFn: ({ dto, id }) => stuffService.editCategory(id, dto),
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: stuffKeys.categories });
      toast.success("Category edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
