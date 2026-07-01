"use client";

import { useCartStore } from "@/zustand/cart.store";
import { CartSheetItem } from "./item/CartSheetItem";

const CartSheetItems = () => {
  const items = useCartStore((state) => state.items);

  if (!items.length) {
    return (
      <div className="flex h-full items-center justify-center text-center text-muted-foreground">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartSheetItem key={item.recipeId} item={item} />
      ))}
    </div>
  );
};

export default CartSheetItems;
