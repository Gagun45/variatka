import { IIngredient } from "@/lib/prisma.args";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../ingredient.api";
import { ingredientKeys } from "../ingredient.keys";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { toast } from "sonner";
import { recipeKeys } from "@/features/recipe/recipe.keys";

type TVariables = { id: number; dto: IIngredientFormValues };

export const useEditIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation<IIngredient, Error, TVariables>({
    mutationFn: ({ dto, id }) => ingredientService.edit(id, dto),

    onSuccess: (updatedIngredient) => {
      queryClient.setQueryData<IIngredient[]>(
        ingredientKeys.ingredients,
        (old = []) =>
          old.map((ingredient) =>
            ingredient.id === updatedIngredient.id
              ? updatedIngredient
              : ingredient,
          ),
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
      toast.success("Ingredient edited successfully!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
};
