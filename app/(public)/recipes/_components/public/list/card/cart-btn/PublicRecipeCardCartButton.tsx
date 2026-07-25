"use client";

import IconButton from "@/components/icon-button/IconButton";
import { Button } from "@/components/ui/button";
import { IPublicRecipe } from "@/lib/types";
import { selectItemQuantity, useCartStore } from "@/zustand/cart.store";
import { Minus, PackageCheck, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  recipe: IPublicRecipe;
}

const PublicRecipeCardCartButton = ({ recipe }: Props) => {
  const defaultVariant =
    recipe.variants.find((variant) => variant.inStock > 0) ??
    recipe.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? 0,
  );
  const selectedVariant =
    recipe.variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;
  const quantity = useCartStore(
    selectItemQuantity(selectedVariant?.id ?? 0),
  );
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const inStock = selectedVariant?.inStock ?? 0;
  const isOutOfStock = inStock === 0;
  const isMaxReached = quantity >= inStock;
  const isRemovingNext = quantity === 1;
  const DecreaseIcon = isRemovingNext ? Trash2 : Minus;

  const variantSelector = (
    <label className="block space-y-1 text-xs text-muted-foreground">
      <span>Варіант</span>
      <select
        className="h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground"
        value={selectedVariant?.id ?? ""}
        onChange={(event) => setSelectedVariantId(Number(event.target.value))}
        disabled={recipe.variants.length === 0}
      >
        {recipe.variants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {variant.label}
            {variant.inStock === 0 ? " — немає в наявності" : ""}
          </option>
        ))}
      </select>
    </label>
  );

  if (isOutOfStock) {
    return (
      <div className="space-y-2">
        {variantSelector}
        <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
          <PackageCheck className="size-3.5" />
          Наразі недоступно
        </p>
        <Button
          className="h-10 w-full justify-center gap-2"
          variant="destructive"
          disabled
        >
          Немає в наявності
        </Button>
      </div>
    );
  }

  if (quantity === 0) {
    return (
      <div className="space-y-2">
        {variantSelector}
        <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
          <PackageCheck className="size-3.5" />У наявності: {inStock}
        </p>
        <Button
          className="h-10 w-full justify-center gap-2"
          onClick={() => addItem(recipe, selectedVariant!.id)}
        >
          <ShoppingCart className="size-4" />
          Додати до кошика
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {variantSelector}
      <p className="flex min-h-4 items-center justify-center gap-1 text-xs text-muted-foreground">
        <PackageCheck className="size-3.5" />
        {isMaxReached ? "Обрано максимум" : `У наявності: ${inStock}`}
      </p>

      <div className="grid h-10 w-full grid-cols-[2.25rem_1fr_2.25rem] items-center rounded-lg border bg-background p-1">
        <IconButton
          variant="ghost"
          size="icon"
          className={`size-8 rounded-md ${isRemovingNext ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : ""}`}
          onClick={() =>
            updateQuantity(selectedVariant!.id, quantity - 1)
          }
          label={
            isRemovingNext
              ? `Видалити ${recipe.title} з кошика`
              : `Зменшити кількість ${recipe.title}`
          }
          title={
            isRemovingNext ? "Видалити з кошика" : "Зменшити кількість"
          }
        >
          <DecreaseIcon className="size-4" />
        </IconButton>

        <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 text-sm font-semibold tabular-nums">
          <ShoppingCart className="size-4 text-muted-foreground" />
          <span>{quantity}</span>
          <span className="text-muted-foreground">у кошику</span>
        </div>

        <IconButton
          variant="ghost"
          size="icon"
          className="size-8 rounded-md"
          disabled={isMaxReached}
          onClick={() =>
            updateQuantity(selectedVariant!.id, quantity + 1)
          }
          label={`Збільшити кількість ${recipe.title}`}
          title={isMaxReached ? "Обрано максимум" : "Збільшити кількість"}
        >
          <Plus className="size-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default PublicRecipeCardCartButton;
