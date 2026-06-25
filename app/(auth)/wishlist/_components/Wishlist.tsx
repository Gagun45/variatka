"use client";

import PublicRecipesList from "@/app/(public)/recipes/_components/public/list/PublicRecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useWishlist } from "@/features/recipe/hooks/useWishlist";

const Wishlist = () => {
  const { data: recipes, isLoading, isError } = useWishlist();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  if (recipes.length === 0)
    return <StateScreen title="No recipes added to wishlist yet" />;
  return <PublicRecipesList recipes={recipes} />;
};

export default Wishlist;
