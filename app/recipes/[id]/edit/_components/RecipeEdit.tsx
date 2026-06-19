"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useUpdateRecipeFields } from "@/features/recipe/hooks/useUpdateRecipeFields";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { frontendUrls } from "@/lib/urls";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useRouter } from "next/navigation";
import DeleteRecipe from "./delete-recipe/DeleteRecipe";
import RecipeIngredientsEdit from "./ing-edit/RecipeIngredientsEdit";

interface Props {
  id: number;
}

const RecipeEdit = ({ id }: Props) => {
  const router = useRouter();
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
  const {
    data: ingredients,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
  } = useIngredients();
  const { mutate, isPending } = useUpdateRecipeFields();
  if (isCategoriesLoading || isRecipesLoading || isIngredientsLoading)
    return <Loader />;
  if (
    isCategoriesError ||
    !categories ||
    isRecipesError ||
    !recipes ||
    !ingredients ||
    isIngredientsError
  )
    return <StateScreen />;
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return <StateScreen title="Recipe not found" />;
  const onSubmit = (dto: IRecipeDto) => {
    mutate(
      {
        dto,
        id,
      },
      {
        onSuccess: () => {
          router.push(frontendUrls.recipes.view(id));
        },
      },
    );
  };

  return (
    <div className="space-y-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Basic information</CardTitle>
        </CardHeader>
        <Separator />

        <CardContent>
          <RecipeForm
            categories={categories}
            isPending={isPending}
            onSubmit={onSubmit}
            initialValues={recipe}
          />
        </CardContent>
      </Card>

      <RecipeIngredientsEdit allIngredients={ingredients} recipe={recipe} />
      <DeleteRecipe id={id} />
    </div>
  );
};

export default RecipeEdit;
