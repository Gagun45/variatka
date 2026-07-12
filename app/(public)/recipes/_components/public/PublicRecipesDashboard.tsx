"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipes } from "@/features/recipe/hooks/usePublicRecipes";
import PublicRecipesTabs from "./tabs/PublicRecipesTabs";

const PublicRecipesDashboard = () => {
  const { data: recipes, isLoading, isError } = usePublicRecipes();

  if (isLoading)
    return (
      <div role="status" aria-label="Завантаження продукції">
        <Loader />
      </div>
    );
  if (isError || !recipes)
    return (
      <StateScreen
        title="Не вдалося завантажити продукцію"
        description="Оновіть сторінку та спробуйте ще раз."
      />
    );
  return <PublicRecipesTabs recipes={recipes} />;
};

export default PublicRecipesDashboard;
