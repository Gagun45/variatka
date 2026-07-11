"use client";

import { ingredientService } from "@/features/ingredient/ingredient.api";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { recipeService } from "@/features/recipe/recipe.api";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { stuffService } from "@/features/stuff/stuff.api";
import { stuffKeys } from "@/features/stuff/stuff.keys";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const QueryPrefetcher = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: recipeKeys.public,
      queryFn: recipeService.getPublicRecipes,
    });
    if (!isAuthenticated) return;
    queryClient.prefetchQuery({
      queryKey: recipeKeys.wishlistIds,
      queryFn: recipeService.getWishlistIds,
    });
    if (!isAdmin) return;

    queryClient.prefetchQuery({
      queryKey: ingredientKeys.ingredients,
      queryFn: ingredientService.get,
    });

    queryClient.prefetchQuery({
      queryKey: recipeKeys.recipes,
      queryFn: recipeService.get,
    });

    queryClient.prefetchQuery({
      queryKey: stuffKeys.stuff,
      queryFn: stuffService.get,
    });
    // queryClient.prefetchQuery({
    //   queryKey: recipeKeys.adminWishlists,
    //   queryFn: recipeService.getAdminWishlists,
    // });
  }, [queryClient, isAdmin, isAuthenticated]);
  return null;
};

export default QueryPrefetcher;
