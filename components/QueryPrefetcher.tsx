import { categoryKeys } from "@/features/category/category.keys";
import { ingredientKeys } from "@/features/ingredient/ingredient.keys";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const QueryPrefetcher = () => {
  const qclient = useQueryClient();
  useEffect(() => {
    qclient.prefetchQuery({
      queryKey: categoryKeys.categories,
    });
    qclient.prefetchQuery({
      queryKey: ingredientKeys.ingredients,
    });
    qclient.prefetchQuery({
      queryKey: recipeKeys.recipes,
    });
  }, [qclient]);
  return null;
};

export default QueryPrefetcher;
