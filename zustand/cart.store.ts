import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IPublicRecipe } from "@/lib/types";

export type ICartItem = {
  recipeId: number;
  variantId: number;
  variantLabel: string;
  name: string;
  imageKey: string | null;
  quantity: number;
  inStock: number;
};

interface ICartStore {
  items: ICartItem[];
  addItem: (recipe: IPublicRecipe, variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clear: () => void;
}

export const useCartStore = create<ICartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (recipe, variantId) =>
        set((state) => {
          const variant = recipe.variants.find((item) => item.id === variantId);
          if (!variant || variant.inStock <= 0) return state;

          const existingItem = state.items.find(
            (item) => item.variantId === variantId,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variantId === variantId
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + 1, variant.inStock),
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
                variantId: variant.id,
                variantLabel: variant.label,
                name: recipe.title,
                imageKey: recipe.imageKey,
                quantity: 1,
                inStock: variant.inStock,
              },
            ],
          };
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.variantId === variantId
                ? {
                    ...item,
                    quantity: Math.min(Math.max(quantity, 0), item.inStock),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "nomly-cart-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// --- Reactive Selectors for Performance ---
export const selectCartItems = (state: ICartStore) => state.items;
export const selectCartTotalQuantity = (state: ICartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectItemQuantity = (variantId: number) => (state: ICartStore) =>
  state.items.find((item) => item.variantId === variantId)?.quantity ?? 0;
