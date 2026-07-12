import { unwrapAction } from "@/lib/actions/action.unwrapper";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
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
  myOrders: (): Promise<IPublicOrder[]> => unwrapAction(() => getMyOrders()),
  allOrders: (): Promise<IPublicOrder[]> => unwrapAction(() => getAllOrders()),
  updateStatus: (dto: IUpdateOrderStatusDto): Promise<IPublicOrder> =>
    unwrapAction(() => updateOrderStatus(dto)),
};
