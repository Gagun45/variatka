"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { IPublicOrder } from "@/lib/types.order";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: IPublicOrder;
}

export function OrderAccordionItem({ order }: Props) {
  return (
    <AccordionItem value={order.id.toString()}>
      <AccordionTrigger className="py-4 px-2 hover:no-underline flex items-center">
        <div className="flex w-full items-center justify-between pr-4">
          <p className="font-medium">Order #{order.id}</p>

          <Badge variant="outline">{order.status}</Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="space-y-5 pb-4">
        <div className="space-y-2 rounded-md border p-4">
          <h4 className="text-sm font-medium">Customer information</h4>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">Name:</span>{" "}
              {order.customerName}
            </p>

            <p>
              <span className="text-foreground">Email:</span>{" "}
              {order.customerEmail}
            </p>

            {order.customerPhone && (
              <p>
                <span className="text-foreground">Phone:</span>{" "}
                {order.customerPhone}
              </p>
            )}

            {order.customerComment && (
              <div className="pt-2">
                <p className="text-foreground">Comment</p>
                <p className="italic">{order.customerComment}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1 border rounded-md p-4">
          <h4 className="text-sm font-medium">Items</h4>

          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
