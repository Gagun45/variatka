"use client";

import PublicRecipesList from "@/app/(public)/recipes/_components/public/list/PublicRecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import { useWishlistIds } from "@/features/recipe/hooks/useWishlist";
import { useMemo } from "react";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const publicRecipes = usePublicRecipes();
  const wishlistIds = useWishlistIds();
  const recipes = useMemo(() => {
    const ids = new Set(wishlistIds.data ?? []);
    return (publicRecipes.data ?? []).filter(({ id }) => ids.has(id));
  }, [publicRecipes.data, wishlistIds.data]);
  const isLoading = publicRecipes.isLoading || wishlistIds.isLoading;
  const isError = publicRecipes.isError || wishlistIds.isError;
  if (isLoading) return <Loader />;
  if (isError)
    return (
      <StateScreen
        title="We couldn't load your wishlist"
        description="Please refresh the page and try again."
      />
    );
  if (recipes.length === 0)
    return (
      <StateScreen
        title="Your wishlist is empty"
        description="Recipes you save will appear here."
        icon={<Heart />}
      />
    );
  return <PublicRecipesList recipes={recipes} />;
};

export default Wishlist;
