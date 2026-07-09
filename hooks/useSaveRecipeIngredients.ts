import { useUpdateRecipeIngredients } from "@/features/recipe/hooks/useUpdateRecipeIngredients";

export const useSaveRecipeIngredients = (recipeId: number) => {
  const { mutate, isPending } = useUpdateRecipeIngredients();

  const save = (items: { ingredientId: number; amount: string }[]) => {
    mutate({ recipeId, items });
  };

  return { save, isPending };
};
