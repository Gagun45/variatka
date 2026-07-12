import { OrderStatus } from "@prisma/client";

export type IOrderStatusFilter = OrderStatus | "all";

export const ORDER_STATUS_FILTER_OPTIONS = [
  { label: "Processing", value: OrderStatus.PROCESSING },
  { label: "Completed", value: OrderStatus.COMPLETED },
  { label: "Cancelled", value: OrderStatus.CANCELLED },
];

export const ORDER_STATUS_FILTER_VALUES = ORDER_STATUS_FILTER_OPTIONS.map(
  ({ value }) => value,
);
