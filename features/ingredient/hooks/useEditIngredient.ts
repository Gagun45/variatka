import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { toast } from "sonner";
import { recipeKeys } from "@/features/recipe/recipe.keys";

type TVariables = { id: number; dto: IIngredientFormValues };

type TContext = {
  prevIngredients?: IIngredient[];
};

export const useEditIngredient = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<IIngredient, Error, TVariables, TContext>({
    mutationFn: ({ dto, id }) => ingredientService.edit(id, dto),

    onSuccess: (updatedIngredient) => {
      qclient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ingredient) =>
            ingredient.id === updatedIngredient.id
              ? updatedIngredient
              : ingredient,
          ),
      );
      qclient.invalidateQueries({ queryKey: ingredientKeys.ingredients });
      qclient.invalidateQueries({ queryKey: recipeKeys.recipes });
      toast.success("Ingredient edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
