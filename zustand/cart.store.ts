import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IPublicRecipe } from "@/lib/types";

export type ICartItem = {
  recipeId: number;
  name: string;
  imageKey: string | null;
  quantity: number;
  inStock: number;
};

interface ICartStore {
  items: ICartItem[];
  addItem: (recipe: IPublicRecipe) => void;
  updateQuantity: (recipeId: number, quantity: number) => void;
  removeItem: (recipeId: number) => void;
  clear: () => void;
}

export const useCartStore = create<ICartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (recipe) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.recipeId === recipe.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.recipeId === recipe.id
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + 1, recipe.inStock),
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                recipeId: recipe.id,
                name: recipe.title,
                imageKey: recipe.imageKey,
                quantity: 1,
                inStock: recipe.inStock,
              },
            ],
          };
        }),

      updateQuantity: (recipeId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.recipeId === recipeId
                ? {
                    ...item,
                    quantity: Math.min(Math.max(quantity, 0), item.inStock),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (recipeId) =>
        set((state) => ({
          items: state.items.filter((item) => item.recipeId !== recipeId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "nomly-cart-storage",
    },
  ),
);

// --- Reactive Selectors for Performance ---
export const selectCartItems = (state: ICartStore) => state.items;
export const selectCartTotalQuantity = (state: ICartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectItemQuantity = (recipeId: number) => (state: ICartStore) =>
  state.items.find((item) => item.recipeId === recipeId)?.quantity ?? 0;
