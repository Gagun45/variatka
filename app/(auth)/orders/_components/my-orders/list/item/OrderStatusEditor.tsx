"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/features/order/hooks/useUpdateOrderStatus";
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/enumslist/order.constants";
import type { OrderStatus } from "@prisma/client";
import { useState } from "react";

interface Props {
  orderId: number;
  status: OrderStatus;
}

export function OrderStatusEditor({ orderId, status }: Props) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const isTerminal = status === "COMPLETED" || status === "CANCELLED";
  const hasChanges = selectedStatus !== status;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasChanges || isTerminal) return;
    updateStatus({ id: orderId, status: selectedStatus });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div>
        <p className="text-sm font-medium">Order status</p>
        <p className="text-xs text-muted-foreground">
          Select a new stage, then save the change.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          disabled={isPending || isTerminal}
          onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
        >
          <SelectTrigger aria-label={`Status for order ${orderId}`}>
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
        <Button type="submit" disabled={!hasChanges || isPending || isTerminal}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
