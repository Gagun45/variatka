"use client";

import { PropsWithChildren, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartSheetHeader from "./header/CartSheetHeader";
import CartSheetItems from "./items/CartSheetItems";
import CartSheetFooter from "./footer/CartSheetFooter";

const CartSheet = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeSheet = () => {
    setIsOpen(false);
  };
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="flex w-full gap-0 bg-background sm:max-w-md">
        <CartSheetHeader />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <CartSheetItems closeSheet={closeSheet} />
        </div>

        <CartSheetFooter closeSheet={closeSheet} />
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
