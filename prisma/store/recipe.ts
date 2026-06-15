import { Ingredient } from "@prisma/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IRecipeIngredientItem {
  ingredient: Ingredient;
  amount: string;
}

interface IRecipeState {
  items: IRecipeIngredientItem[];
  addItem: (ingredient: IRecipeIngredientItem) => void;
  removeItem: (ingredientId: number) => void;
  updateAmount: (ingredientId: number, amount: string) => void;
  clear: () => void;
}

export const useRecipeStore = create<IRecipeState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const exists = state.items.some(
            (item) => item.ingredient.id === newItem.ingredient.id,
          );

          if (exists) return state;

          return { items: [...state.items, newItem] };
        }),

      removeItem: (ingredientId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.ingredient.id !== ingredientId,
          ),
        })),

      updateAmount: (ingredientId, amount) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.ingredient.id === ingredientId ? { ...item, amount } : item,
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
