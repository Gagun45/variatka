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
  const { isAdmin } = useAuth();
  const qclient = useQueryClient();
  useEffect(() => {
    if (!isAdmin) return;
    qclient.prefetchQuery({
      queryKey: ingredientKeys.categories,
      queryFn: ingredientService.getCategories,
    });
    qclient.prefetchQuery({
      queryKey: ingredientKeys.ingredients,
      queryFn: ingredientService.get,
    });

    qclient.prefetchQuery({
      queryKey: recipeKeys.categories,
      queryFn: recipeService.getCategories,
    });
    qclient.prefetchQuery({
      queryKey: recipeKeys.recipes,
      queryFn: recipeService.get,
    });
    qclient.prefetchQuery({
      queryKey: stuffKeys.categories,
      queryFn: stuffService.getCategories,
    });
    qclient.prefetchQuery({
      queryKey: stuffKeys.stuff,
      queryFn: stuffService.get,
    });
  }, [qclient, isAdmin]);
  return null;
};

export default QueryPrefetcher;
