"use client";

import AdminIngredientCategories from "./ing-cats/AdminIngredientCategories";
import AdminRecipeCategories from "./rec-cats/AdminRecipeCategories";
import AdminStuffCategories from "./stuff-cats/AdminStuffCategories";

const AdminCategories = () => {
  return (
    <div className="space-y-4 border p-2 rounded-md">
      <p className="text-center">Categories</p>
      <AdminIngredientCategories />
      <AdminRecipeCategories />
      <AdminStuffCategories />
    </div>
  );
};

export default AdminCategories;
