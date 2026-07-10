"use client";

import PublicRecipesList from "@/app/(public)/recipes/_components/public/list/PublicRecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useWishlist } from "@/features/recipe/hooks/useWishlist";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { data: recipes, isLoading, isError } = useWishlist();
  if (isLoading) return <Loader />;
  if (isError || !recipes)
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
