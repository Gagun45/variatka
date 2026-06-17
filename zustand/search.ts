import { create } from "zustand";

interface ISearchState {
  query: string;
  setQuery: (query: string) => void;
  clear: () => void;
}

export const useSearch = create<ISearchState>((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
  clear: () => set({ query: "" }),
}));
