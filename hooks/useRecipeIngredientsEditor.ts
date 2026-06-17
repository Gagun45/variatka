import { useState } from "react";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeIngredient } from "@/lib/types";

export type IRecipeItem = IRecipeIngredient & {
  title: string;
};

export const useRecipeIngredientsEditor = (recipe: IRecipe) => {
  const initialItems: IRecipeItem[] = recipe.ingredients.map((ing) => ({
    amount: ing.amount,
    ingredientId: ing.ingredientId,
    title: ing.ingredient.title,
  }));

  const [items, setItems] = useState<IRecipeItem[]>(initialItems);

  const isAmountNotSet = items.some((i) => !i.amount);

  const updateAmount = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.ingredientId === id ? { ...i, amount: value } : i)),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.ingredientId !== id));
  };

  const addItem = (ingredient: { id: number; title: string }) => {
    setItems((prev) => {
      if (prev.some((i) => i.ingredientId === ingredient.id)) return prev;

      return [
        ...prev,
        {
          ingredientId: ingredient.id,
          title: ingredient.title,
          amount: "",
        },
      ];
    });
  };

  const reset = () => setItems(initialItems);

  return {
    items,
    setItems,
    updateAmount,
    removeItem,
    addItem,
    reset,
    isAmountNotSet,
    initialItems,
  };
};
