import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useWishlist = () => {
  return useQuery({
    queryKey: recipeKeys.wishlist,
    queryFn: recipeService.getWishlist,
  });
};
