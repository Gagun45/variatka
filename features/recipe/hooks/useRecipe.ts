import { useQuery, useQueryClient } from "@tanstack/react-query";
import { recipeKeys } from "../recipe.keys";
import { recipeService } from "../recipe.api";
import { IRecipe } from "@/lib/prisma.args";

export const useRecipe = (id: number) => {
  const qclient = useQueryClient();
  return useQuery({
    queryKey: recipeKeys.recipe(id),
    queryFn: () => recipeService.getOne(id),
    initialData: () => {
      const recipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      return recipes?.find((r) => r.id === id);
    },
  });
};
