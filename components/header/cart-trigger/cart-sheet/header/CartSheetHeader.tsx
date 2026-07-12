"use client";

import { Badge } from "@/components/ui/badge";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ShoppingBag } from "lucide-react";

const CartSheetHeader = () => {
  const itemsCount = useCartStore((state) => selectCartTotalQuantity(state));

  return (
    <SheetHeader className="border-b bg-card px-5 py-5 pr-12">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="size-5 text-muted-foreground" />
            Кошик
          </SheetTitle>
          <SheetDescription className="sr-only">
            Перегляньте вибрані товари перед оформленням замовлення.
          </SheetDescription>
        </div>

        <Badge variant="secondary" className="shrink-0">
          {itemsCount} шт.
        </Badge>
      </div>
    </SheetHeader>
  );
};

export default CartSheetHeader;
