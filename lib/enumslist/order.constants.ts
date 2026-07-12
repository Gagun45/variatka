import type { OrderStatus } from "@prisma/client";
import { IOption } from "../types";

export type IOrderStatusFilter = OrderStatus | "all";

export const ORDER_STATUSES = [
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

const ORDER_STATUS_LABELS = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} satisfies Record<OrderStatus, string>;

export const ORDER_STATUS_FILTER_OPTIONS: IOption<OrderStatus>[] =
  ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABELS[status],
    value: status,
  }));

export const ORDER_STATUS_FILTER_VALUES = ORDER_STATUS_FILTER_OPTIONS.map(
  ({ value }) => value,
);
