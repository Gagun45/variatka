import { IRecipeDto } from "@/zod/recipe.schema";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IRecipeIngredientItem {
  id: number;
  title: string;
  amount: string;
}

interface IRecipeState {
  items: IRecipeIngredientItem[];

  draft: IRecipeDto;
  setDraft: (draft: Partial<IRecipeDto>) => void;

  addItem: (ingredient: IRecipeIngredientItem) => void;
  removeItem: (ingredientId: number) => void;
  updateAmount: (ingredientId: number, amount: string) => void;
  clear: () => void;
}

const initialDraft: IRecipeDto = {
  title: "",
  description: "",
  notes: "",
  inStock: 0,
  recipeCategoryId: 0,
};

export const useRecipeStore = create<IRecipeState>()(
  persist(
    (set) => ({
      items: [],
      draft: initialDraft,

      setDraft: (draft) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...draft,
          },
        })),

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

      clear: () =>
        set({
          items: [],
          draft: initialDraft,
        }),
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
