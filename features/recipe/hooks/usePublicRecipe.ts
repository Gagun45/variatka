import { IPublicRecipe } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const usePublicRecipe = (id: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.publicOne(id),
    queryFn: () => recipeService.getPublicRecipe(id),
    initialData: () =>
      queryClient
        .getQueryData<IPublicRecipe[]>(recipeKeys.public)
        ?.find((recipe) => recipe.id === id),
  });
};
