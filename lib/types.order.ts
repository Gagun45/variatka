import { ICreateOrderFormValues } from "@/zod/order.schema";
import { OrderStatus } from "@prisma/client";

export interface IOrderItemDto {
  id: number;
  amount: number;
}

export interface ICreateOrderDto {
  formValues: ICreateOrderFormValues;
  orderItems: IOrderItemDto[];
}

export interface IUpdateOrderStatusDto {
  id: number;
  status: OrderStatus;
}

export interface IPublicOrder {
  id: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  customerComment: string | null;
  status: OrderStatus;
  items: IPublicOrderItem[];
  createdAt: string;
}

export interface IPublicOrderItem {
  id: number;
  title: string;
  amount: number;
}
