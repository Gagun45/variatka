// stores/ingredient-filters.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IStockType } from "@/lib/constants/stock.options";
import { IIngredientCategoryFilter } from "@/lib/enumslist/ingredient.constants";
import { IIngredientSortType } from "@/lib/sorting.ingredients";

type IngredientFiltersStore = {
  category: IIngredientCategoryFilter;
  stock: IStockType;
  sort: IIngredientSortType;

  setCategory: (category: IIngredientCategoryFilter) => void;
  setStock: (stock: IStockType) => void;
  setSort: (sort: IIngredientSortType) => void;

  reset: () => void;
};

export const useIngredientFiltersStore = create<IngredientFiltersStore>()(
  persist(
    (set) => ({
      category: "all",
      sort: "usage-desc",
      stock: "all",

      setCategory: (category) => set({ category }),
      setStock: (stock) => set({ stock }),
      setSort: (sort) => set({ sort }),

      reset: () =>
        set({
          category: "all",
          sort: "usage-desc",
          stock: "all",
        }),
    }),
    {
      name: "nomly-ingredient-filters",
    },
  ),
);
