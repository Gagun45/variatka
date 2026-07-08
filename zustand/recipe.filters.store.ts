import { IConfirmedType } from "@/lib/constants/confirmed.optionts";
import { IReadyToMakeType } from "@/lib/constants/ready-to-make.options";
import { IStockType } from "@/lib/constants/stock.options";
import { IRecipeHiddenFilter } from "@/lib/enumslist/hidden.constants";
import { IRecipeCategoryFilter } from "@/lib/enumslist/recipe.constants";
import { IRecipeSeriesFilter } from "@/lib/enumslist/series.constants";
import { IRecipeSortType } from "@/lib/sorting.recipes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecipeFiltersState = {
  category: IRecipeCategoryFilter;
  stock: IStockType;
  ready: IReadyToMakeType;
  confirmed: IConfirmedType;
  series: IRecipeSeriesFilter;
  sort: IRecipeSortType;
  hidden: IRecipeHiddenFilter;

  setCategory: (v: IRecipeCategoryFilter) => void;
  setStock: (v: IStockType) => void;
  setReady: (v: IReadyToMakeType) => void;
  setConfirmed: (v: IConfirmedType) => void;
  setSeries: (v: IRecipeSeriesFilter) => void;
  setSort: (v: IRecipeSortType) => void;
  setHidden: (v: IRecipeHiddenFilter) => void;

  reset: () => void;
};

export const useRecipeFiltersStore = create<RecipeFiltersState>()(
  persist(
    (set) => ({
      category: "all",
      stock: "all",
      ready: "all",
      confirmed: "all",
      series: "all",
      sort: "newest",
      hidden: "visible",

      setCategory: (category) => set({ category }),
      setStock: (stock) => set({ stock }),
      setReady: (ready) => set({ ready }),
      setConfirmed: (confirmed) => set({ confirmed }),
      setSeries: (series) => set({ series }),
      setSort: (sort) => set({ sort }),
      setHidden: (hidden) => set({ hidden }),

      reset: () =>
        set({
          category: "all",
          stock: "all",
          ready: "all",
          confirmed: "all",
          series: "all",
          sort: "newest",
          hidden: "visible",
        }),
    }),
    {
      name: "nomly-recipe-filters",
    },
  ),
);
