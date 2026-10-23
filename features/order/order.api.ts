import { readCollection } from "@/lib/data/client";
import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createOrder,
  updateOrderStatus,
} from "@/lib/actions/order.actions";
import {
  ICreateOrderDto,
  IPublicOrder,
  IUpdateOrderStatusDto,
} from "@/lib/types.order";

export const orderService = {
  createOrder: (dto: ICreateOrderDto): Promise<IPublicOrder> =>
    unwrapAction(() => createOrder(dto)),
  myOrders: (): Promise<IPublicOrder[]> => readCollection("myOrders"),
  allOrders: (): Promise<IPublicOrder[]> => readCollection("allOrders"),
  updateStatus: (dto: IUpdateOrderStatusDto): Promise<IPublicOrder> =>
    unwrapAction(() => updateOrderStatus(dto)),
};
