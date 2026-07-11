import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleSavedRecipe = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, number, TContext>({
    mutationFn: (recipeId) => recipeService.toggle(recipeId),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevRecipes = queryClient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isSaved: !rec.isSaved } : rec,
        ),
      );

      return { prevRecipes };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onError: (e, recipeId, context) => {
      toast.error(e.message);
      if (context?.prevRecipes) {
        queryClient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
