"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/enumslist/order.constants";
import type { IPublicOrder } from "@/lib/types.order";
import { CalendarDays, PackageCheck } from "lucide-react";
import { OrderDetails } from "./OrderDetails";
import { OrderStatusEditor } from "./OrderStatusEditor";

interface Props {
  order: IPublicOrder;
  canUpdateStatus?: boolean;
}

const orderDateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
});

export function OrderAccordionItem({ order, canUpdateStatus = false }: Props) {
  const itemCount = order.items.reduce((total, item) => total + item.amount, 0);
  const createdAt = new Date(order.createdAt);
  const statusClassName =
    order.status === "COMPLETED"
      ? "border-success/30 bg-success/10 text-success"
      : order.status === "CANCELLED"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : "border-border bg-secondary text-secondary-foreground";

  return (
    <AccordionItem
      value={order.id.toString()}
      className="overflow-hidden rounded-md border bg-card shadow-surface transition-shadow data-[state=open]:shadow-raised"
    >
      <AccordionTrigger className="items-center rounded-none px-4 py-4 hover:bg-muted/40 hover:no-underline sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2 pr-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <PackageCheck className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">Замовлення №{order.id}</p>
              <time
                dateTime={createdAt.toISOString()}
                className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground"
              >
                <CalendarDays className="size-3" aria-hidden="true" />
                Оформлено {orderDateFormatter.format(createdAt)}
              </time>
              <p className="text-xs font-normal text-muted-foreground">
                {itemCount} од.
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`w-fit px-2.5 font-semibold capitalize shadow-surface ${statusClassName}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="border-t bg-muted/15 p-0 [&_p:not(:last-child)]:mb-0">
        {canUpdateStatus && (
          <OrderStatusEditor orderId={order.id} status={order.status} />
        )}
        <OrderDetails order={order} itemCount={itemCount} />
      </AccordionContent>
    </AccordionItem>
  );
}
