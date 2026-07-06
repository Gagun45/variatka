import { IOrder } from "../prisma.args";
import { IPublicOrder } from "../types.order";

export const orderPresenter = {
  toPublic: (order: IOrder): IPublicOrder => {
    return {
      id: order.id,
      customerPhone: order.customerPhone,
      customerComment: order.customerComment,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      status: order.status,
      items: order.items.map((i) => ({
        amount: i.amount,
        id: i.recipeId,
        title: i.recipeTitle,
      })),
    };
  },
};
