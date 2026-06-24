import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../recipe.api";
import { recipeKeys } from "../recipe.keys";
import { IPublicRecipe } from "@/lib/types";
import { toast } from "sonner";

type TContext = {
  prevWishlist?: IPublicRecipe[];
};

export const useToggleWishlist = () => {
  const qclient = useQueryClient();
  const mutation = useMutation<boolean, Error, number, TContext>({
    mutationFn: recipeService.toggleWishlist,
    onMutate: async (recipeId: number) => {
      await qclient.cancelQueries({
        queryKey: recipeKeys.wishlist,
      });
      const prevWishlist =
        qclient.getQueryData<IPublicRecipe[]>(recipeKeys.wishlist) || [];
      const publicRecipes =
        qclient.getQueryData<IPublicRecipe[]>(recipeKeys.public) || [];

      const recipe = publicRecipes.find((r) => r.id === recipeId);

      const isAlreadyWished = prevWishlist.some((r) => r.id === recipeId);

      const nextWishlist: IPublicRecipe[] = isAlreadyWished
        ? prevWishlist.filter((r) => r.id !== recipeId)
        : recipe
          ? [...prevWishlist, recipe]
          : prevWishlist;
      qclient.setQueryData(recipeKeys.wishlist, nextWishlist);
      return { prevWishlist };
    },
    onSettled: () => {
      qclient.invalidateQueries({ queryKey: recipeKeys.wishlist });
    },
    onError: (e, _, context) => {
      toast.error(e.message);
      if (context?.prevWishlist) {
        qclient.setQueryData(recipeKeys.wishlist, context.prevWishlist);
      }
    },
  });
  return mutation;
};
