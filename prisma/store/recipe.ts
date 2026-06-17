import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IRecipeIngredientItem {
  id: number;
  title: string;
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
          const exists = state.items.some((item) => item.id === newItem.id);

          if (exists) return state;

          return { items: [...state.items, newItem] };
        }),

      removeItem: (ingredientId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== ingredientId),
        })),

      updateAmount: (ingredientId, amount) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === ingredientId ? { ...item, amount } : item,
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
