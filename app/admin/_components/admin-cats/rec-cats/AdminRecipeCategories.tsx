import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import { useRecipes } from "@/features/recipe/hooks/useRecipes";
import AdminRecipeCategoriesList from "./list/AdminRecipeCategoriesList";

const AdminRecipeCategories = () => {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useRecipeCategories();

  const {
    data: recipes,
    isLoading: recipesLoading,
    isError: recipesError,
  } = useRecipes();

  if (categoriesLoading || recipesLoading) return <Loader />;
  if (categoriesError || recipesError || !categories || !recipes) {
    return <StateScreen />;
  }

  return (
    <AdminRecipeCategoriesList categories={categories} recipes={recipes} />
  );
};

export default AdminRecipeCategories;
