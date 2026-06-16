"use client";

import RecipesAccordion from "@/app/recipes/_components/recipes/recipeTabs/accordion/RecipesAccordion";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipesByIngredientId } from "@/features/recipe/hooks/useRecipesByIngredientId";

interface Props {
  id: number;
}

const IngredientRecipes = ({ id }: Props) => {
  const { data: recipes, isLoading, isError } = useRecipesByIngredientId(id);
  if (isLoading) return <Loader />;
  if (isError || !recipes) return <StateScreen title="Something went wrong" />;
  if (recipes.length === 0)
    return <p>The ingredient is not being used in any recipe yet</p>;
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        This ingredient is used in {recipes.length} recipes:
      </p>
      <RecipesAccordion recipes={recipes} />
    </div>
  );
};

export default IngredientRecipes;
