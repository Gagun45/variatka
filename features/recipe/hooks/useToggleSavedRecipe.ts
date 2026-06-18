import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TVariables = {
  isSaved: boolean;
  recipeId: number;
};

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleSavedRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, TVariables, TContext>({
    mutationFn: ({ isSaved, recipeId }) =>
      recipeService.toggle(recipeId, !isSaved),
    onMutate: async ({ recipeId, isSaved }) => {
      await qclient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isSaved: !isSaved } : rec,
        ),
      );
      return { prevRecipes };
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
