import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useToggleHiddenRecipe = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, number, TContext>({
    mutationFn: (recipeId) => recipeService.toggleHidden(recipeId),
    onMutate: async (recipeId) => {
      await qclient.cancelQueries({ queryKey: recipeKeys.recipes });

      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) =>
          rec.id === recipeId ? { ...rec, isHidden: !rec.isHidden } : rec,
        ),
      );

      return { prevRecipes };
    },
    onSettled: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
      qclient.invalidateQueries({ queryKey: recipeKeys.public });
    },
    onError: (e, _, context) => {
      toast.error(e.message);
      if (context?.prevRecipes) {
        qclient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }
    },
  });
  return mutation;
};
