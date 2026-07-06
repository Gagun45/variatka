import { unwrapAction } from "@/lib/actions/action.unwrapper";
import { createOrder, getMyOrders } from "@/lib/actions/order.actions";
import { ICreateOrderDto, IPublicOrder } from "@/lib/types.order";

export const orderService = {
  createOrder: (dto: ICreateOrderDto): Promise<IPublicOrder> =>
    unwrapAction(() => createOrder(dto)),
  myOrders: (): Promise<IPublicOrder[]> => unwrapAction(() => getMyOrders()),
};
