import { useQuery } from "@tanstack/react-query";
import { orderKeys } from "../order.keys";
import { orderService } from "../order.api";

export const useMyOrders = () => {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: orderService.myOrders,
  });
};
