import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeUpdate = ({ recipe }: Props) => {
  const { data: categories, isLoading, isError } = useRecipeCategories();
  if (isLoading) return <Loader />;
  if (isError || !categories)
    return <StateScreen title="Something went wrong" />;
  return <></>;
  // return <RecipeForm categories={categories} />;
};

export default RecipeUpdate;
