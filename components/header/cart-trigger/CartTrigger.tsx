"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ShoppingCart } from "lucide-react";
import CartSheet from "./cart-sheet/CartSheet";

const CartTrigger = () => {
  const quantity = useCartStore((s) => selectCartTotalQuantity(s));

  return (
    <CartSheet>
      <Button
        variant="outline"
        size="icon"
        className="relative h-10 w-10 rounded-full"
      >
        <ShoppingCart className="size-5" />

        {quantity > 0 && (
          <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-1">
            {quantity}
          </Badge>
        )}
      </Button>
    </CartSheet>
  );
};

export default CartTrigger;
