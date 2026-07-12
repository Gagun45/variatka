"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";
import { useCartStore } from "@/zustand/cart.store";
import { ShoppingCart } from "lucide-react";
import { CartSheetItem } from "./item/CartSheetItem";

interface Props {
  closeSheet: () => void;
}

const CartSheetItems = ({ closeSheet }: Props) => {
  const items = useCartStore((state) => state.items);

  if (!items.length) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <ShoppingCart className="size-6" />
        </div>
        <h3 className="text-base font-medium">Ваш кошик порожній</h3>
        <p className="mt-1 max-w-64 text-sm text-muted-foreground">
          Додайте товари до кошика, і вони з’являться тут.
        </p>
        <Button asChild className="mt-5">
          <Link href={frontendUrls.public.recipes} onClick={closeSheet}>
            Переглянути продукцію
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <CartSheetItem key={item.recipeId} item={item} closeSheet={closeSheet} />
      ))}
    </div>
  );
};

export default CartSheetItems;
