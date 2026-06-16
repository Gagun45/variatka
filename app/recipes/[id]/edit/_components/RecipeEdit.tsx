"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipe } from "@/features/recipe/hooks/useRecipe";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import { useUpdateRecipeFields } from "@/features/recipe/hooks/useUpdateRecipeFields";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const { mutate, isPending } = useUpdateRecipeFields();
  if (isCategoriesLoading || isRecipesLoading) return <Loader />;
  if (isCategoriesError || !categories || isRecipesError || !recipes)
    return <StateScreen title="Something went wrong" />;
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
          router.push(`/ingredients/${id}`);
          toast.success("Ingredient edited successfully!");
        },
        onError: (e) => {
          toast.error(e.message);
        },
      },
    );
  };

  return <div className="space-y-12">Recipe edit!</div>;
};

export default RecipeEdit;
