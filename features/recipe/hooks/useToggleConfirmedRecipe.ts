import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TVariables = {
  isConfirmed: boolean;
  recipeId: number;
};

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleConfirmedRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, TVariables, TContext>({
    mutationFn: ({ isConfirmed, recipeId }) =>
      recipeService.toggleConfirmed(recipeId, isConfirmed),
    onMutate: ({ recipeId, isConfirmed }) => {
      qclient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isConfirmed: !isConfirmed } : rec,
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
