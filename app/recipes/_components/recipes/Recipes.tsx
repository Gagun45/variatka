"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import NewRecipeCategoryForm from "@/forms/add-recipe-category/NewRecipeCategoryForm";
import RecipeTasb from "./recipeTabs/RecipeTabs";

const Recipes = () => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useRecipeCategories();

  const {
    data: recipes,
    isLoading: isRecipesLoading,
    isError: isRecipesError,
  } = useRecipes();

  if (isCategoriesLoading || isRecipesLoading) {
    return <Loader />;
  }

  if (isCategoriesError || isRecipesError || !categories || !recipes) {
    return <StateScreen title="Something went wrong" />;
  }
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h1>No recipes categories yet</h1>
        <NewRecipeCategoryForm />
      </div>
    );
  }

  return <RecipeTasb categories={categories} recipes={recipes} />;
};

export default Recipes;
