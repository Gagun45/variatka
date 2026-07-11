"use client";

import IconButton from "@/components/icon-button/IconButton";
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
        badge={quantity > 0 ? quantity : undefined}
      >
        <ShoppingCart className="size-4.5" />

      </IconButton>
    </CartSheet>
  );
};

export default CartTrigger;
