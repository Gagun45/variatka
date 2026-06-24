"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import StuffCategoryForm from "@/forms/add-stuff-category/StuffCategoryForm";
import StuffTabs from "./tabs/StuffTabs";
import { useCreateStuffCategory } from "@/features/stuff/hooks/useCreateStuffCategory";
import { ICreateStuffCategoryDto } from "@/zod/stuff.schema";

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

  const { mutate, isPending } = useCreateStuffCategory();

  const onCategoryCreate = (dto: ICreateStuffCategoryDto) => {
    mutate(dto);
  };

  if (isCategoriesLoading || isStuffLoading) {
    return <Loader />;
  }

  if (isCategoriesError || isStuffError || !categories || !stuff) {
    return <StateScreen />;
  }
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h2>No stuff categories yet</h2>
        <StuffCategoryForm isPending={isPending} onSubmit={onCategoryCreate} />
      </div>
    );
  }
  return <StuffTabs categories={categories} stuff={stuff} />;
};

export default StuffDashboard;
