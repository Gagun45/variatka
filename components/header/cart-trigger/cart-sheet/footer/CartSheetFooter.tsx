"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface Props {
  closeSheet: () => void;
}

const CartSheetFooter = ({ closeSheet }: Props) => {
  const totalItems = useCartStore((s) => selectCartTotalQuantity(s));
  if (totalItems === 0) return null;
  return (
    <SheetFooter className="border-t bg-card/80 p-4">
      <Button asChild className="h-10 w-full">
        <Link href="/checkout" onClick={closeSheet}>
          Proceed to checkout
          <ArrowRight className="size-4" />
        </Link>
      </Button>

      <Button onClick={closeSheet} variant="outline" className="h-10 w-full">
        <ShoppingBag className="size-4" />
        Continue shopping
      </Button>
    </SheetFooter>
  );
};

export default CartSheetFooter;
