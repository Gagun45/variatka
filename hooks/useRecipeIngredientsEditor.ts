import { useCallback, useMemo, useState } from "react";
import { IRecipe } from "@/lib/prisma.args";
import {
  IRecipeIngredient,
  IRecipeIngredientEditorItem,
} from "@/lib/types";

const getInitialItems = (recipe: IRecipe): IRecipeIngredientEditorItem[] =>
  recipe.ingredients.map((ing) => ({
    amount: ing.amount,
    ingredientId: ing.ingredientId,
    title: ing.ingredient.title,
    isSaved: ing.ingredient.isSaved,
    isInStock: ing.ingredient.isInStock,
  }));

const serializeItems = (items: IRecipeIngredientEditorItem[]) =>
  JSON.stringify(
    items.map((item) => ({
      ingredientId: item.ingredientId,
      amount: item.amount.trim(),
    })),
  );

export const useRecipeIngredientsEditor = (recipe: IRecipe) => {
  const initialItems = useMemo(() => getInitialItems(recipe), [recipe]);
  const initialSnapshot = useMemo(
    () => serializeItems(initialItems),
    [initialItems],
  );

  const [state, setState] = useState({
    sourceSnapshot: initialSnapshot,
    items: initialItems,
  });

  const currentState =
    state.sourceSnapshot === initialSnapshot
      ? state
      : {
          sourceSnapshot: initialSnapshot,
          items: initialItems,
        };

  if (state.sourceSnapshot !== initialSnapshot) {
    setState(currentState);
  }

  const { items } = currentState;

  const emptyAmountCount = items.filter((i) => !i.amount.trim()).length;
  const isDirty = serializeItems(items) !== initialSnapshot;
  const canSave = isDirty && emptyAmountCount === 0;

  const updateAmount = useCallback((id: number, value: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.ingredientId === id ? { ...i, amount: value } : i,
      ),
    }));
  }, []);

  const removeItem = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.ingredientId !== id),
    }));
  }, []);

  const updateSaved = useCallback((id: number, isSaved: boolean) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.ingredientId === id ? { ...i, isSaved } : i,
      ),
    }));
  }, []);

  const updateStock = useCallback((id: number, isInStock: boolean) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.ingredientId === id ? { ...i, isInStock } : i,
      ),
    }));
  }, []);

  const addItem = useCallback((ingredient: {
    id: number;
    title: string;
    isSaved: boolean;
    isInStock: boolean;
  }) => {
    setState((prev) => {
      if (prev.items.some((i) => i.ingredientId === ingredient.id)) {
        return prev;
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            ingredientId: ingredient.id,
            title: ingredient.title,
            isSaved: ingredient.isSaved,
            isInStock: ingredient.isInStock,
            amount: "",
          },
        ],
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      sourceSnapshot: initialSnapshot,
      items: initialItems,
    });
  }, [initialItems, initialSnapshot]);

  const toPayload = useCallback(
    (): IRecipeIngredient[] =>
      items.map((i) => ({
        ingredientId: i.ingredientId,
        amount: i.amount.trim(),
      })),
    [items],
  );

  return {
    items,
    updateAmount,
    removeItem,
    updateSaved,
    updateStock,
    addItem,
    reset,
    toPayload,
    canSave,
    emptyAmountCount,
    isDirty,
    isAmountNotSet: emptyAmountCount > 0,
    initialItems,
  };
};
