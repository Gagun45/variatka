"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/features/order/hooks/useUpdateOrderStatus";
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/enumslist/order.constants";
import { IPublicOrder } from "@/lib/types.order";
import { OrderStatus } from "@prisma/client";
import {
  CalendarDays,
  Mail,
  MessageSquareText,
  PackageCheck,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: IPublicOrder;
  canUpdateStatus?: boolean;
}

const orderDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function OrderAccordionItem({ order, canUpdateStatus = false }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const itemCount = order.items.reduce((total, item) => total + item.amount, 0);
  const createdAt = new Date(order.createdAt);
  const statusLabel = order.status.toLowerCase().replaceAll("_", " ");
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
              <p className="font-semibold">Order #{order.id}</p>
              <time
                dateTime={createdAt.toISOString()}
                className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground"
              >
                <CalendarDays className="size-3" aria-hidden="true" />
                Placed {orderDateFormatter.format(createdAt)}
              </time>
              <p className="text-xs font-normal text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`w-fit px-2.5 font-semibold capitalize shadow-surface ${statusClassName}`}
          >
            {statusLabel}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="border-t bg-muted/15 p-0 [&_p:not(:last-child)]:mb-0">
        {canUpdateStatus && (
          <div className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-medium">Order status</p>
              <p className="text-xs text-muted-foreground">
                Update the current stage of this order.
              </p>
            </div>
            <Select
              value={order.status}
              disabled={isPending}
              onValueChange={(status) =>
                updateStatus({ id: order.id, status: status as OrderStatus })
              }
            >
              <SelectTrigger aria-label={`Status for order ${order.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <section aria-labelledby={`customer-${order.id}`}>
            <h3
              id={`customer-${order.id}`}
              className="mb-3 text-xs font-semibold uppercase text-muted-foreground"
            >
              Customer details
            </h3>

            <dl className="grid gap-3 text-sm">
              <div className="flex min-w-0 items-start gap-3">
                <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Name</dt>
                  <dd className="break-words font-medium">
                    {order.customerName}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="break-all font-medium">
                    {order.customerEmail}
                  </dd>
                </div>
              </div>
              {order.customerPhone && (
                <div className="flex min-w-0 items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Phone</dt>
                    <dd className="break-words font-medium">
                      {order.customerPhone}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {order.customerComment && (
              <div className="mt-5 flex items-start gap-3 border-t pt-4 text-sm">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Order note</p>
                  <p className="mt-1 break-words leading-relaxed">
                    {order.customerComment}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby={`items-${order.id}`}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3
                id={`items-${order.id}`}
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Order items
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShoppingBag className="size-3.5" aria-hidden="true" />
                {itemCount} total
              </span>
            </div>

            <div className="divide-y border-y">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
