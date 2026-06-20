import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredientCategories } from "@/features/ingredient/hooks/useIngredientCategories";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";
import AdminIngredientCategoriesList from "./list/AdminIngredientCategoriesList";

const AdminIngredientCategories = () => {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useIngredientCategories();

  const {
    data: ingredients,
    isLoading: ingredientsLoading,
    isError: ingredientsError,
  } = useIngredients();

  if (categoriesLoading || ingredientsLoading) return <Loader />;
  if (categoriesError || ingredientsError || !categories || !ingredients) {
    return <StateScreen />;
  }

  return (
    <AdminIngredientCategoriesList
      categories={categories}
      ingredients={ingredients}
    />
  );
};

export default AdminIngredientCategories;
