"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";

const CartSheetFooter = () => {
  return (
    <SheetFooter>
      <Button asChild className="w-full">
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
    </SheetFooter>
  );
};

export default CartSheetFooter;
