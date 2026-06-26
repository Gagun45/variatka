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

    onSuccess: (updatedRecipe) => {
      qclient.setQueryData<IRecipe[]>(recipeKeys.recipes, (old = []) =>
        old.map((recipe) =>
          recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
        ),
      );

      qclient.invalidateQueries({
        queryKey: recipeKeys.recipes,
      });
      qclient.invalidateQueries({ queryKey: recipeKeys.public });

      toast.success("Recipe edited successfully!");
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
