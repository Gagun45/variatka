import { create } from "zustand";

type AuthState = {
  isAdmin: boolean;
  hydrated: boolean;
  setIsAdmin: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  hydrated: false,

  setIsAdmin: (value) => set({ isAdmin: value }),

  setHydrated: (value) => set({ hydrated: value }),
}));
