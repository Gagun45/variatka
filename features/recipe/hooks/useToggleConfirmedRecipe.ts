import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleConfirmedRecipe = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, number, TContext>({
    mutationFn: (recipeId) => recipeService.toggleConfirmed(recipeId),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.recipes });

      const prevRecipes = queryClient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      queryClient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isConfirmed: !rec.isConfirmed } : rec,
        ),
      );

      return { prevRecipes };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
    },
    onError: (e, _, context) => {
      toast.error(e.message);
      if (context?.prevRecipes) {
        queryClient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
