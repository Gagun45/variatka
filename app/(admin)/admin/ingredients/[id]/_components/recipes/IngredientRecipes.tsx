"use client";

import RecipesList from "@/app/(admin)/admin/recipes/_components/recipes/recipeTabs/recipes-list/RecipesList";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";

interface Props {
  id: number;
}

const IngredientRecipes = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipes();
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen />;
  if (recipes.length === 0)
    return <p>The ingredient is not being used in any recipe yet</p>;
  const filteredRecipes = recipes.filter((r) =>
    r.ingredients.some((i) => i.ingredientId === id),
  );
  if (filteredRecipes.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        This ingredient is not used in any recipes
      </p>
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
