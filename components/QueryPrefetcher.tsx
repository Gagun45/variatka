"use client";

import { categoryService } from "@/features/category/category.api";
import { categoryKeys } from "@/features/category/category.keys";
import { ingredientService } from "@/features/ingredient/ingredient.api";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { recipeService } from "@/features/recipe/recipe.api";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const QueryPrefetcher = () => {
  const qclient = useQueryClient();
  useEffect(() => {
    qclient.prefetchQuery({
      queryKey: categoryKeys.categories,
      queryFn: categoryService.get,
    });
    qclient.prefetchQuery({
      queryKey: ingredientKeys.ingredients,
      queryFn: ingredientService.get,
    });
    qclient.prefetchQuery({
      queryKey: recipeKeys.recipes,
      queryFn: recipeService.get,
    });
  }, [qclient]);
  return null;
};

export default QueryPrefetcher;
