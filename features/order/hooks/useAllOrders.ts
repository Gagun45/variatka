import { useQuery } from "@tanstack/react-query";
import { orderService } from "../order.api";
import { orderKeys } from "../order.keys";

export const useAllOrders = () => {
  return useQuery({
    queryKey: orderKeys.allOrders,
    queryFn: orderService.allOrders,
  });
};
