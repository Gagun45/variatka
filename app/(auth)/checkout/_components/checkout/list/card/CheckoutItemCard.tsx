"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/image.helper";
import { frontendUrls } from "@/lib/urls";
import { ICartItem, useCartStore } from "@/zustand/cart.store";
import { Minus, PackageCheck, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  item: ICartItem;
}

const CheckoutItemCard = ({ item }: Props) => {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const imageSrc = getImageUrl(item.imageKey);
  const isMaxReached = item.quantity >= item.inStock;

  return (
    <Card className="gap-0 py-0" size="sm">
      <CardContent className="grid gap-4 p-3 sm:grid-cols-[112px_1fr]">
        <Link
          href={frontendUrls.public.view(item.recipeId)}
          className="relative aspect-square overflow-hidden rounded-lg bg-muted sm:size-28"
        >
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="112px"
            className="object-cover transition duration-200 hover:scale-105"
          />
        </Link>

        <div className="flex min-w-0 flex-col gap-3">
          <CardHeader className="p-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CardTitle>
                  <Link
                    href={frontendUrls.public.view(item.recipeId)}
                    className="line-clamp-2 hover:underline"
                  >
                    {item.name}
                  </Link>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <PackageCheck className="size-3" />
                    {item.inStock} available
                  </Badge>
                  {isMaxReached && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Max selected
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.recipeId)}
                aria-label={`Remove ${item.name} from checkout`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <Separator />

          <CardFooter className="flex flex-col items-stretch gap-3 rounded-none border-0 bg-transparent p-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled={item.quantity === 1}
                className="size-8"
                onClick={() => updateQuantity(item.recipeId, item.quantity - 1)}
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="size-3.5" />
              </Button>

              <div className="grid h-8 min-w-12 place-items-center rounded-lg border bg-background px-3 text-sm font-semibold">
                {item.quantity}
              </div>

              <Button
                size="icon"
                variant="outline"
                disabled={isMaxReached}
                className="size-8"
                onClick={() => updateQuantity(item.recipeId, item.quantity + 1)}
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </CardFooter>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutItemCard;
