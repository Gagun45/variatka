"use client";

import { useAuthStore } from "@/zustand/auth.store";
import RecipeDraftSheet from "./RecipeDraftSheet";

const Draft = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) return null;
  return <RecipeDraftSheet />;
};

export default Draft;
