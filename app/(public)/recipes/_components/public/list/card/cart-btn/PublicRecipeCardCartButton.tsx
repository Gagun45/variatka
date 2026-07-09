"use client";

import IconButton from "@/components/icon-button/IconButton";
import { Button } from "@/components/ui/button";
import { IPublicRecipe } from "@/lib/types";
import { useCartStore, selectItemQuantity } from "@/zustand/cart.store";
import { Minus, PackageCheck, Plus, ShoppingCart, Trash2 } from "lucide-react";

interface Props {
  recipe: IPublicRecipe;
}

const PublicRecipeCardCartButton = ({ recipe }: Props) => {
  const quantity = useCartStore(selectItemQuantity(recipe.id));
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isOutOfStock = recipe.inStock === 0;
  const isMaxReached = quantity >= recipe.inStock;
  const isRemovingNext = quantity === 1;
  const DecreaseIcon = isRemovingNext ? Trash2 : Minus;

  if (isOutOfStock) {
    return (
      <div className="space-y-2">
        <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
          <PackageCheck className="size-3.5" />
          Currently unavailable
        </p>
        <Button
          className="h-10 w-full justify-center gap-2"
          variant="destructive"
          disabled
        >
          Out of stock
        </Button>
      </div>
    );
  }

  if (quantity === 0) {
    return (
      <div className="space-y-2">
        <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
          <PackageCheck className="size-3.5" />
          {recipe.inStock} available
        </p>
        <Button
          className="h-10 w-full justify-center gap-2"
          onClick={() => addItem(recipe)}
        >
          <ShoppingCart className="size-4" />
          Add to cart
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
        <PackageCheck className="size-3.5" />
        {isMaxReached ? "Maximum selected" : `${recipe.inStock} available`}
      </p>

      <div className="grid h-10 w-full grid-cols-[2.25rem_1fr_2.25rem] items-center rounded-lg border bg-background p-1">
        <IconButton
          variant="ghost"
          size="icon"
          className={`size-8 rounded-md ${isRemovingNext ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : ""}`}
          onClick={() => updateQuantity(recipe.id, quantity - 1)}
          label={
            isRemovingNext
              ? `Remove ${recipe.title} from cart`
              : `Decrease ${recipe.title} quantity`
          }
          title={isRemovingNext ? "Remove from cart" : "Decrease quantity"}
        >
          <DecreaseIcon className="size-4" />
        </IconButton>

        <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 text-sm font-semibold tabular-nums">
          <ShoppingCart className="size-4 text-muted-foreground" />
          <span>{quantity}</span>
          <span className="text-muted-foreground">in cart</span>
        </div>

        <IconButton
          variant="ghost"
          size="icon"
          className="size-8 rounded-md"
          disabled={isMaxReached}
          onClick={() => updateQuantity(recipe.id, quantity + 1)}
          label={`Increase ${recipe.title} quantity`}
          title={isMaxReached ? "Maximum selected" : "Increase quantity"}
        >
          <Plus className="size-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default PublicRecipeCardCartButton;
