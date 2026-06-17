import { create } from "zustand";

type AuthState = {
  isAdmin: boolean;
  hydrated: boolean;
  isAuthenticated: boolean;

  setIsAdmin: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  hydrated: false,

  isAuthenticated: false,
  setIsAdmin: (value) => set({ isAdmin: value }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setHydrated: (value) => set({ hydrated: value }),
}));
