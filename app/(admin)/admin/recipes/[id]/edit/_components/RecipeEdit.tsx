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
import { useUpdateRecipe } from "@/features/recipe/hooks/useUpdateRecipe";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { useRecipeIngredientsEditor } from "@/hooks/useRecipeIngredientsEditor";
import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { IRecipeDto } from "@/zod/recipe.schema";
import { RotateCcw, Save, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteRecipe from "./delete-recipe/DeleteRecipe";
import RecipeIngredientsEdit from "./ing-edit/RecipeIngredientsEdit";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";

interface Props {
  id: number;
}

const RecipeEdit = ({ id }: Props) => {
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
  if (isRecipesLoading || isIngredientsLoading) return <Loader />;
  if (isRecipesError || !recipes || !ingredients || isIngredientsError)
    return (
      <StateScreen
        title="We couldn't load the recipe editor"
        description="Please refresh the page and try again."
      />
    );
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe)
    return (
      <StateScreen
        title="Recipe not found"
        description="It may have been removed or the link is incorrect."
        icon={<SearchX />}
      />
    );
  return <LoadedRecipeEdit recipe={recipe} ingredients={ingredients} />;
};

interface LoadedRecipeEditProps {
  recipe: IRecipe;
  ingredients: IIngredient[];
}

const LoadedRecipeEdit = ({ recipe, ingredients }: LoadedRecipeEditProps) => {
  const router = useRouter();
  const formId = `recipe-edit-${recipe.id}`;
  const editor = useRecipeIngredientsEditor(recipe);
  const { mutate, isPending } = useUpdateRecipe();

  const onSubmit = (dto: IRecipeDto) => {
    mutate(
      {
        dto,
        id: recipe.id,
        items: editor.toPayload(),
      },
      {
        onSuccess: () => {
          router.push(frontendUrls.recipes.view(recipe.id));
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
            formId={formId}
            hideActions
            isDisabled={editor.emptyAmountCount > 0}
            onReset={editor.reset}
            initialValues={{
              ...recipe,
              confirmationNotes: recipe.confirmationNotes ?? "",
            }}
          />
        </CardContent>
      </Card>

      <RecipeIngredientsEdit
        allIngredients={ingredients}
        editor={editor}
        isPending={isPending}
      />

      <div className="sticky bottom-0 z-40 grid grid-cols-2 gap-2 rounded-xl border bg-background/90 p-2 shadow-lg backdrop-blur-md sm:static sm:flex sm:justify-end sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <Button
          type="reset"
          form={formId}
          variant="outline"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="size-4" />
          Reset all
        </Button>
        <LoadingButton
          type="submit"
          form={formId}
          isPending={isPending}
          disabled={editor.emptyAmountCount > 0}
          className="w-full sm:w-auto sm:min-w-36"
        >
          <Save className="size-4" />
          Save recipe
        </LoadingButton>
      </div>

      <DeleteRecipe id={recipe.id} />
    </div>
  );
};

export default RecipeEdit;
