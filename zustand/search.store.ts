import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ISearchBarItem {
  type: "ingredient" | "recipe" | "stuff";
  id: number;
  title: string;
}

interface ISearchState {
  query: string;
  recentQueries: ISearchBarItem[];

  addRecentQuery: (item: ISearchBarItem) => void;
  setQuery: (query: string) => void;
  clear: () => void;
}

export const useSearch = create<ISearchState>()(
  persist(
    (set) => ({
      query: "",
      recentQueries: [],

      setQuery: (query) => set({ query }),

      clear: () => set({ query: "" }),

      addRecentQuery: (item) =>
        set((state) => {
          const filtered = state.recentQueries.filter(
            (i) => !(i.type === item.type && i.id === item.id),
          );

          return {
            recentQueries: [item, ...filtered].slice(0, 5),
          };
        }),
    }),
    {
      name: "search-storage", // localStorage key
    },
  ),
);
