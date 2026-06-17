"use client";

import { useAuth } from "@/hooks/useIsAdmin";
import RecipeDraftSheet from "./RecipeDraftSheet";

const Draft = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  return <RecipeDraftSheet />;
};

export default Draft;
