"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { frontendUrls } from "@/lib/urls";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface Props {
  closeSheet: () => void;
}

const CartSheetFooter = ({ closeSheet }: Props) => {
  const productsCount = useCartStore((s) => s.items.length);
  const totalItems = useCartStore((s) => selectCartTotalQuantity(s));
  if (totalItems === 0) return null;
  return (
    <SheetFooter className="border-t bg-card/80 p-4">
      <div className="rounded-xl border bg-background p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Products</span>
          <span className="font-medium">{productsCount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Total quantity</span>
          <span className="font-semibold">
            {totalItems} item{totalItems !== 1 && "s"}
          </span>
        </div>
      </div>

      <Button asChild className="h-10 w-full">
        <Link href="/checkout" onClick={closeSheet}>
          Proceed to checkout
          <ArrowRight className="size-4" />
        </Link>
      </Button>

      <Button asChild variant="outline" className="h-10 w-full">
        <Link href={frontendUrls.public.recipes} onClick={closeSheet}>
          <ShoppingBag className="size-4" />
          Continue shopping
        </Link>
      </Button>
    </SheetFooter>
  );
};

export default CartSheetFooter;
