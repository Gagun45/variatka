"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";

interface Props {
  closeSheet: () => void;
}

const CartSheetFooter = ({ closeSheet }: Props) => {
  const totalItems = useCartStore((s) => selectCartTotalQuantity(s));
  if (totalItems === 0) return null;
  return (
    <SheetFooter>
      <Button asChild className="w-full">
        <Link href="/checkout" onClick={closeSheet}>
          Proceed to Checkout
        </Link>
      </Button>
    </SheetFooter>
  );
};

export default CartSheetFooter;
