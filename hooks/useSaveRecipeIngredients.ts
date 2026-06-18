import { useUpdateRecipeIngredients } from "@/features/recipe/hooks/useUpdateRecipeIngredients";
import { frontendUrls } from "@/lib/urls";
import { useRouter } from "next/navigation";

export const useSaveRecipeIngredients = (recipeId: number) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateRecipeIngredients();

  const save = (items: { ingredientId: number; amount: string }[]) => {
    mutate(
      { recipeId, items },
      {
        onSuccess: () => {
          router.push(frontendUrls.recipes.view(recipeId));
        },
      },
    );
  };

  return { save, isPending };
};
