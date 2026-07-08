"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
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
  if (isRecipesLoading || isIngredientsLoading) return <Loader />;
  if (isRecipesError || !recipes || !ingredients || isIngredientsError)
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
    <div className="space-y-8">
      <Card className="gap-0">
        <CardHeader className="p-4 sm:p-6">
          <div className="space-y-1">
            <CardTitle>Basic information</CardTitle>
            <CardDescription>
              Update recipe metadata, publishing state, and admin notes.
            </CardDescription>
          </div>
        </CardHeader>
        <Separator />

        <CardContent className="p-4 sm:p-6">
          <RecipeForm
            isPending={isPending}
            onSubmit={onSubmit}
            initialValues={{
              ...recipe,
              confirmationNotes: recipe.confirmationNotes ?? "",
            }}
          />
        </CardContent>
      </Card>

      <RecipeIngredientsEdit allIngredients={ingredients} recipe={recipe} />
      <DeleteRecipe id={id} />
    </div>
  );
};

export default RecipeEdit;
