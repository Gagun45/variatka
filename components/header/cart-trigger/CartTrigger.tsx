"use client";

import IconButton from "@/components/icon-button/IconButton";
import { Badge } from "@/components/ui/badge";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ShoppingCart } from "lucide-react";
import CartSheet from "./cart-sheet/CartSheet";

const CartTrigger = () => {
  const quantity = useCartStore((s) => selectCartTotalQuantity(s));

  return (
    <CartSheet>
      <IconButton
        variant="ghost"
        size="icon"
        label={"Кошик"}
        className="relative rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
      >
        <ShoppingCart className="size-4.5" />

        {quantity > 0 && (
          <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full border-2 border-sidebar bg-primary px-1 text-[10px] leading-none text-primary-foreground shadow-sm">
            {quantity}
          </Badge>
        )}
      </IconButton>
    </CartSheet>
  );
};

export default CartTrigger;
