"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/image.helper";
import { ICartItem, useCartStore } from "@/zustand/cart.store";
import Link from "next/link";
import { frontendUrls } from "@/lib/urls";

interface Props {
  item: ICartItem;
}

export function CartSheetItem({ item }: Props) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isMaxReached = item.quantity >= item.inStock;

  const imageSrc = getImageUrl(item.imageKey);

  return (
    <div className="flex items-center px-2 gap-4 border-b py-1">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={frontendUrls.public.view(item.recipeId)}
          className="font-medium text-sm hover:underline break-all"
        >
          {item.name}
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={item.quantity === 1}
            className="size-7"
            onClick={() => updateQuantity(item.recipeId, item.quantity - 1)}
          >
            <Minus className="size-3" />
          </Button>

          <span className="w-6 text-center text-xs font-semibold">
            {item.quantity}
          </span>

          <Button
            size="icon"
            variant="outline"
            className="size-7"
            disabled={isMaxReached}
            onClick={() => updateQuantity(item.recipeId, item.quantity + 1)}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive size-8"
        onClick={() => removeItem(item.recipeId)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
