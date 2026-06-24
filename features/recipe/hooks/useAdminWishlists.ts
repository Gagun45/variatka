import { useQuery } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";

export const useAdminWishlists = () => {
  return useQuery({
    queryKey: recipeKeys.adminWishlists,
    queryFn: recipeService.getAdminWishlists,
  });
};
