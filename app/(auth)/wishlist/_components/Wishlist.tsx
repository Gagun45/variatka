"use client";

import PublicRecipesList from "@/app/(public)/recipes/_components/public/list/PublicRecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import { useWishlistIds } from "@/features/recipe/hooks/useWishlistIds";
import { useMemo } from "react";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const publicRecipes = usePublicRecipes();
  const wishlistIdsQuery = useWishlistIds();
  const recipes = useMemo(() => {
    const wishlistIds = new Set(wishlistIdsQuery.data ?? []);
    return (publicRecipes.data ?? []).filter(({ id }) => wishlistIds.has(id));
  }, [publicRecipes.data, wishlistIdsQuery.data]);
  const isLoading = publicRecipes.isLoading || wishlistIdsQuery.isLoading;
  const isError = publicRecipes.isError || wishlistIdsQuery.isError;
  if (isLoading)
    return (
      <div role="status" aria-label="Завантаження обраного">
        <Loader />
      </div>
    );
  if (isError)
    return (
      <StateScreen
        title="Не вдалося завантажити обране"
        description="Оновіть сторінку та спробуйте ще раз."
      />
    );
  if (recipes.length === 0)
    return (
      <StateScreen
        title="В обраному поки нічого немає"
        description="Збережені товари з’являться тут."
        icon={<Heart />}
      />
    );
  return <PublicRecipesList recipes={recipes} />;
};

export default Wishlist;
