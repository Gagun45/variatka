import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleSavedRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, number, TContext>({
    mutationFn: (recipeId) => recipeService.toggle(recipeId),
    onMutate: async (recipeId) => {
      await qclient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isSaved: !rec.isSaved } : rec,
        ),
      );
      return { prevRecipes };
    },
    onSettled: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onError: (e, _variables, context) => {
      toast.error(e.message);
      if (context?.prevRecipes) {
        qclient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
