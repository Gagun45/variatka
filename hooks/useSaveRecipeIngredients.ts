import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateRecipeIngredients } from "@/features/recipe/hooks/useUpdateRecipeIngredients";
import { frontendUrls } from "@/lib/urls";

export const useSaveRecipeIngredients = (recipeId: number) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateRecipeIngredients();

  const save = (items: { ingredientId: number; amount: string }[]) => {
    mutate(
      { recipeId, items },
      {
        onSuccess: () => {
          router.push(frontendUrls.recipes.view(recipeId));
          toast.success("Recipe edited!");
        },
        onError: () => toast.error("Something went wrong"),
      },
    );
  };

  return { save, isPending };
};
