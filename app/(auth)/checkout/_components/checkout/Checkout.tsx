"use client";

import StateScreen from "@/components/state-screen/StateScreen";
import { selectCartItems, useCartStore } from "@/zustand/cart.store";
import CheckoutItemsList from "./list/CheckoutItemsList";

const Checkout = () => {
  const items = useCartStore((s) => selectCartItems(s));
  if (items.length === 0) return <StateScreen title="Cart is empty" />;
  return (
    <div className="flex flex-col gap-2">
      <CheckoutItemsList items={items} />
    </div>
  );
};

export default Checkout;
