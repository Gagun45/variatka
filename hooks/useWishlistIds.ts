import { useWishlist } from "@/features/recipe/hooks/useWishlist";
import { useMemo } from "react";

export const useWishlistIdsSet = () => {
  const { data } = useWishlist();
  return useMemo(() => {
    return new Set(data?.map((r) => r.id) ?? []);
  }, [data]);
};
