"use client";

import RecipesList from "@/app/(admin)/admin/recipes/_components/recipes/recipeTabs/recipes-list/RecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { BookOpen } from "lucide-react";

interface Props {
  id: number;
}

const IngredientRecipes = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  const filteredRecipes = recipes.filter((r) =>
    r.ingredients.some((i) => i.ingredientId === id),
  );
  if (filteredRecipes.length === 0)
    return (
      <StateScreen
        title="No recipes use this ingredient"
        description="Recipes containing this ingredient will appear here."
        icon={<BookOpen />}
      />
    );
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        This ingredient is used in {filteredRecipes.length} recipes:
      </p>
      <RecipesList recipes={filteredRecipes} />
    </div>
  );
};

export default IngredientRecipes;
