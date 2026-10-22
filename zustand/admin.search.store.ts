import { create } from "zustand";

type AdminSearchStore = {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
};

// Shared across admin routes, but deliberately not persisted across refreshes.
export const useAdminSearchStore = create<AdminSearchStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
