import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useWishlistIds = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: recipeKeys.wishlistIds,
    queryFn: recipeService.getWishlistIds,
    enabled: isAuthenticated,
  });
};

export const useWishlistIdSet = () => {
  const { data: wishlistIds } = useWishlistIds();

  return useMemo(() => new Set(wishlistIds ?? []), [wishlistIds]);
};
