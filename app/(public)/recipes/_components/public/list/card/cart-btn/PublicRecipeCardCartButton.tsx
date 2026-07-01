"use client";

import { Button } from "@/components/ui/button";
import { IPublicRecipe } from "@/lib/types";
import { useCartStore, selectItemQuantity } from "@/zustand/cart.store";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Props {
  recipe: IPublicRecipe;
}

const PublicRecipeCardCartButton = ({ recipe }: Props) => {
  const quantity = useCartStore(selectItemQuantity(recipe.id));
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isOutOfStock = recipe.inStock === 0;
  const isMaxReached = quantity >= recipe.inStock;

  if (isOutOfStock) {
    return (
      <Button className="h-10 w-full" variant="destructive" disabled>
        Out of stock
      </Button>
    );
  }

  if (quantity === 0) {
    return (
      <Button className="h-10 w-full" onClick={() => addItem(recipe)}>
        <ShoppingCart className="mr-2 size-4" />
        Add to cart
      </Button>
    );
  }

  return (
    <div className="flex h-10 items-center justify-center gap-3 rounded-lg border p-1 w-full bg-background">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => updateQuantity(recipe.id, quantity - 1)}
      >
        <Minus className="size-4" />
      </Button>

      <span className="min-w-8 text-center font-semibold text-sm">
        {quantity}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={isMaxReached}
        onClick={() => updateQuantity(recipe.id, quantity + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};

export default PublicRecipeCardCartButton;
