"use client";

import AdminIngredientCategories from "./ing-cats/AdminIngredientCategories";
import AdminRecipeCategories from "./rec-cats/AdminRecipeCategories";

const AdminCategories = () => {
  return (
    <div className="space-y-4 border p-2 rounded-md">
      <p className="text-center">Categories</p>
      <AdminIngredientCategories />
      <AdminRecipeCategories />
    </div>
  );
};

export default AdminCategories;
