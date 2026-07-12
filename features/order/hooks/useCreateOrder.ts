import { ICreateOrderDto, IPublicOrder } from "@/lib/types.order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService } from "../order.api";
import { orderKeys } from "../order.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IPublicOrder, Error, ICreateOrderDto>({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.orders });
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      toast.success("Замовлення створено!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
