import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { toast } from "sonner";

type TContext = {
  previousIds: number[];
};

export const useToggleWishlist = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<boolean, Error, number, TContext>({
    mutationFn: recipeService.toggleWishlist,
    onMutate: async (recipeId: number) => {
      await qclient.cancelQueries({
        queryKey: recipeKeys.wishlistIds,
      });
      const previousIds =
        qclient.getQueryData<number[]>(recipeKeys.wishlistIds) ?? [];
      const nextIds = previousIds.includes(recipeId)
        ? previousIds.filter((id) => id !== recipeId)
        : [...previousIds, recipeId];

      qclient.setQueryData(recipeKeys.wishlistIds, nextIds);
      return { previousIds };
    },
    onSettled: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.wishlistIds });
    },
    onError: (e, _, context) => {
      toast.error(e.message);
      if (context) {
        qclient.setQueryData(recipeKeys.wishlistIds, context.previousIds);
      }
    },
  });
  return mutation;
};
