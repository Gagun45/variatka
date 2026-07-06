import { ICreateOrderDto, IPublicOrder } from "@/lib/types.order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService } from "../order.api";
import { orderKeys } from "../order.keys";

export const useCreateOrder = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IPublicOrder, Error, ICreateOrderDto>({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      qclient.invalidateQueries({ queryKey: orderKeys.orders });
      toast.success("Order created!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
