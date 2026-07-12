import { IUpdateOrderStatusDto, IPublicOrder } from "@/lib/types.order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService } from "../order.api";
import { orderKeys } from "../order.keys";

type Context = {
  previousOrders?: IPublicOrder[];
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IPublicOrder, Error, IUpdateOrderStatusDto, Context>({
    mutationFn: orderService.updateStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.allOrders });
      const previousOrders = queryClient.getQueryData<IPublicOrder[]>(
        orderKeys.allOrders,
      );

      queryClient.setQueryData<IPublicOrder[]>(orderKeys.allOrders, (old = []) =>
        old.map((order) => (order.id === id ? { ...order, status } : order)),
      );

      return { previousOrders };
    },
    onSuccess: () => toast.success("Order status updated"),
    onError: (error, _, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.allOrders, context.previousOrders);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.orders });
    },
  });
};
