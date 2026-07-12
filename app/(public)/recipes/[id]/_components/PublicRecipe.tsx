"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { usePublicRecipe } from "@/features/recipe/hooks/usePublicRecipe";
import { SearchX } from "lucide-react";
import PublicRecipeView from "./public/view/PublicRecipeView";

interface Props {
  id: number;
}

const PublicRecipe = ({ id }: Props) => {
  const { data: recipe, isLoading, isError, error } = usePublicRecipe(id);

  if (isLoading)
    return (
      <div role="status" aria-label="Завантаження інформації про товар">
        <Loader />
      </div>
    );

  if (isError) {
    const isNotFound = error.message === "Recipe not found";
    return (
      <StateScreen
        title={
          isNotFound ? "Товар не знайдено" : "Не вдалося завантажити товар"
        }
        description={
          isNotFound
            ? "Можливо, товар видалено або посилання неправильне."
            : "Оновіть сторінку та спробуйте ще раз."
        }
        icon={isNotFound ? <SearchX /> : undefined}
      />
    );
  }

  if (!recipe) return null;
  return <PublicRecipeView recipe={recipe} />;
};

export default PublicRecipe;
