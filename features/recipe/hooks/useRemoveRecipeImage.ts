import { useMutation, useQueryClient } from "@tanstack/react-query";

import { IRecipe } from "@/lib/prisma.args";
import { toast } from "sonner";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";

export const useRemoveRecipeImage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<IRecipe, Error, number>({
    mutationFn: recipeService.removeImage,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.recipes });
      toast.success("Image removed!");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return mutation;
};
