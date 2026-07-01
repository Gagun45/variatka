"use client";

import { PropsWithChildren } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartSheetHeader from "./header/CartSheetHeader";
import CartSheetItems from "./items/CartSheetItems";
import CartSheetFooter from "./footer/CartSheetFooter";

const CartSheet = ({ children }: PropsWithChildren) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <CartSheetHeader />

        <div className="flex-1 overflow-y-auto py-6">
          <CartSheetItems />
        </div>

        <CartSheetFooter />
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
