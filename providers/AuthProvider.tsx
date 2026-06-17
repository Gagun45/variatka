"use client";

import { useEffect } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useAuthStore } from "@/zustand/auth.store";
import { KINDE_ROLES } from "@/lib/constants/kinde";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getPermission, isLoading, isAuthenticated } = useKindeBrowserClient();

  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setIsAdmin(false);
      return;
    }

    const isAdmin = getPermission(KINDE_ROLES.admin)?.isGranted ?? false;

    setIsAdmin(isAdmin);
  }, [isLoading, getPermission, setIsAdmin, isAuthenticated]);

  return children;
}
