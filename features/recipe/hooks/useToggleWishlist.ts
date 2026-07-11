import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TContext = {
  previousIds: number[];
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<boolean, Error, number, TContext>({
    mutationFn: recipeService.toggleWishlist,
    onMutate: async (recipeId: number) => {
      await queryClient.cancelQueries({
        queryKey: recipeKeys.wishlistIds,
      });
      const previousIds =
        queryClient.getQueryData<number[]>(recipeKeys.wishlistIds) ?? [];
      const nextIds = previousIds.includes(recipeId)
        ? previousIds.filter((id) => id !== recipeId)
        : [...previousIds, recipeId];

      queryClient.setQueryData(recipeKeys.wishlistIds, nextIds);
      return { previousIds };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.wishlistIds });
    },
    onError: (e, _, context) => {
      toast.error(e.message);
      if (context) {
        queryClient.setQueryData(recipeKeys.wishlistIds, context.previousIds);
      }
    },
  });
  return mutation;
};
