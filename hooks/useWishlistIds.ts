import { useWishlistIds } from "@/features/recipe/hooks/useWishlist";
import { useMemo } from "react";

export const useWishlistIdsSet = () => {
  const { data } = useWishlistIds();
  return useMemo(() => {
    return new Set(data ?? []);
  }, [data]);
};
