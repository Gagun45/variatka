"use client";

import Image from "next/image";
import { Minus, PackageCheck, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/image.helper";
import { ICartItem, useCartStore } from "@/zustand/cart.store";
import Link from "next/link";
import { frontendUrls } from "@/lib/urls";

interface Props {
  item: ICartItem;
  closeSheet: () => void;
}

export function CartSheetItem({ item, closeSheet }: Props) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isMaxReached = item.quantity >= item.inStock;

  const imageSrc = getImageUrl(item.imageKey);

  return (
    <article className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="grid grid-cols-[72px_1fr_auto] gap-3">
        <Link
          href={frontendUrls.public.view(item.recipeId)}
          className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-muted"
          onClick={closeSheet}
        >
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover transition duration-200 hover:scale-105"
            sizes="72px"
          />
        </Link>

        <div className="min-w-0 space-y-2">
          <Link
            href={frontendUrls.public.view(item.recipeId)}
            className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
            onClick={closeSheet}
          >
            {item.name}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1 px-1.5 text-[11px]">
              <PackageCheck className="size-3" />
              {item.inStock} available
            </Badge>
            {isMaxReached && (
              <Badge
                variant="outline"
                className="text-[11px] text-muted-foreground"
              >
                Max selected
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="-mr-1 -mt-1 size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => removeItem(item.recipeId)}
          aria-label={`Remove ${item.name} from cart`}
          title="Remove from cart"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Quantity
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={item.quantity === 1}
            className="size-8 rounded-full"
            onClick={() => updateQuantity(item.recipeId, item.quantity - 1)}
            aria-label={`Decrease ${item.name} quantity`}
            title="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </Button>

          <span className="grid h-8 min-w-12 place-items-center rounded-full border bg-background px-3 text-sm font-semibold tabular-nums">
            {item.quantity}
          </span>

          <Button
            size="icon"
            variant="outline"
            className="size-8 rounded-full"
            disabled={isMaxReached}
            onClick={() => updateQuantity(item.recipeId, item.quantity + 1)}
            aria-label={`Increase ${item.name} quantity`}
            title="Increase quantity"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
