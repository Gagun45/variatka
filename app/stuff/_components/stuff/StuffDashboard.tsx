"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffTabs from "./tabs/StuffTabs";
import NewStuffCategoryForm from "@/forms/add-stuff-category/NewStuffCategoryForm";

const StuffDashboard = () => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useStuffCategories();

  const {
    data: stuff,
    isLoading: isStuffLoading,
    isError: isStuffError,
  } = useStuff();

  if (isCategoriesLoading || isStuffLoading) {
    return <Loader />;
  }

  if (isCategoriesError || isStuffError || !categories || !stuff) {
    return <StateScreen />;
  }
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h1>No stuff categories yet</h1>
        <NewStuffCategoryForm />
      </div>
    );
  }
  return <StuffTabs categories={categories} stuff={stuff} />;
};

export default StuffDashboard;
