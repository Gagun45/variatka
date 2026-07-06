"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { frontendUrls } from "@/lib/urls";
import { IPublicOrderItem } from "@/lib/types.order";

interface Props {
  item: IPublicOrderItem;
}

export function OrderItemRow({ item }: Props) {
  return (
    <div className="flex items-center justify-between py-2">
      <Link
        href={frontendUrls.public.view(item.id)}
        className="text-sm hover:underline underline-offset-4"
      >
        {item.title}
      </Link>

      <Badge variant="secondary">{item.amount}</Badge>
    </div>
  );
}
