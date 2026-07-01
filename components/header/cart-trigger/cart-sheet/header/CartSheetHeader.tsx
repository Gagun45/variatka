"use client";

import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";

const CartSheetHeader = () => {
  const itemsCount = useCartStore((state) => selectCartTotalQuantity(state));

  return (
    <SheetHeader className="border-b pb-4">
      <SheetTitle>Shopping cart</SheetTitle>
      <SheetDescription>
        {itemsCount} item{itemsCount !== 1 && "s"}
      </SheetDescription>
    </SheetHeader>
  );
};

export default CartSheetHeader;
