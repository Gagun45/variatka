import { IRecipe } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipeDto } from "@/zod/recipe.schema";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TVariables = { id: number; dto: IRecipeDto };

type TContext = {
  prevRecipes?: IRecipe[];
};

export const useUpdateRecipeFields = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, TVariables, TContext>({
    mutationFn: ({ dto, id }) => recipeService.updateFields(id, dto),
    onMutate: async ({ dto, id }) => {
      await qclient.cancelQueries({ queryKey: recipeKeys.recipes });
      const prevRecipes = qclient.getQueryData<IRecipe[]>(recipeKeys.recipes);
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((rec) => (rec.id === id ? { ...rec, ...dto } : rec)),
      );
      return { prevRecipes };
    },
    onSettled: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
    },
    onSuccess: () => {
      toast.success("Recipe edited successfully!");
    },
    onError: (e, _, context) => {
      if (context?.prevRecipes) {
        qclient.setQueryData(recipeKeys.recipes, context.prevRecipes);
      }

      toast.error(e.message);
    },
  });
  return mutation;
};
