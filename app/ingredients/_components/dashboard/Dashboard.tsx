"use client";

import NewCategoryForm from "@/forms/add-category/NewCategoryForm";
import DashboardTabs from "./tabs/DashboardTabs";
import { useCategories } from "@/features/category/hooks/useCategories";
import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useIngredients } from "@/features/ingredient/hooks/useIngredients";

const Dashboard = () => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  const {
    data: ingredients,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
  } = useIngredients();

  if (isCategoriesLoading || isIngredientsLoading) {
    return <Loader />;
  }

  if (isCategoriesError || isIngredientsError || !categories || !ingredients) {
    return <StateScreen title="Something went wrong" />;
  }
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h1>No categories yet</h1>
        <p>Create your first category to get started.</p>
        <NewCategoryForm />
      </div>
    );
  }
  return <DashboardTabs categories={categories} ingredients={ingredients} />;
};

export default Dashboard;
