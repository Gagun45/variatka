"use client";

import Link from "next/link";
import { frontendUrls } from "@/lib/urls";
import { IPublicOrderItem } from "@/lib/types.order";
import { ArrowUpRight } from "lucide-react";

interface Props {
  item: IPublicOrderItem;
}

export function OrderItemRow({ item }: Props) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-3">
      <Link
        href={frontendUrls.public.view(item.id)}
        className="group flex min-w-0 items-center gap-1.5 text-sm font-medium no-underline! transition-colors hover:text-primary!"
      >
        <span className="truncate">{item.title}</span>
        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </Link>

      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        Кількість: <span className="font-semibold text-foreground">{item.amount}</span>
      </span>
    </div>
  );
}
