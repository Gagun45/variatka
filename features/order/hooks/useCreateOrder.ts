import { ICreateOrderDto, IPublicOrder } from "@/lib/types.order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService } from "../order.api";
import { orderKeys } from "../order.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";

export const useCreateOrder = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IPublicOrder, Error, ICreateOrderDto>({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: orderKeys.orders });
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
      qclient.invalidateQueries({ queryKey: recipeKeys.public });
      toast.success("Order created!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
