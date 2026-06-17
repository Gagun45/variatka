import { create } from "zustand";

type AuthState = {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  setIsAdmin: (value) => set({ isAdmin: value }),
}));
