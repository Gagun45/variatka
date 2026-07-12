import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recipeService } from "@/features/recipe/recipe.api";
import { recipeKeys } from "@/features/recipe/recipe.keys";
import { IRecipe } from "@/lib/prisma.args";
import { toast } from "sonner";

export const useUploadRecipeImage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    IRecipe,
    Error,
    { ingredientId: number; file: File }
  >({
    mutationFn: ({ file, ingredientId }) =>
      recipeService.uploadImage(ingredientId, file),
    onSuccess: () => {
      toast.success("Upload success!");
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      queryClient.invalidateQueries({ queryKey: recipeKeys.public });
    },

    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
