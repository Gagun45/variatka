import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";
import { useAuth } from "@/hooks/useAuth";

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: recipeKeys.wishlist,
    queryFn: recipeService.getWishlist,
    enabled: isAuthenticated,
  });
};
