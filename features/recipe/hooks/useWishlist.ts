import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";
import { useAuth } from "@/hooks/useAuth";

export const useWishlistIds = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: recipeKeys.wishlistIds,
    queryFn: recipeService.getWishlistIds,
    enabled: isAuthenticated,
  });
};
