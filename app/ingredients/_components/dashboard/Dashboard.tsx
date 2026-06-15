import NewCategoryForm from "@/forms/add-category/NewCategoryForm";
import { getCategories, getIngredients } from "@/lib/actions";
import DashboardTabs from "./tabs/DashboardTabs";

const Dashboard = async () => {
  const categories = await getCategories();
  const ingredients = await getIngredients();
  if (!categories.length) {
    return (
      <div className="space-y-6 text-center mx-auto">
        <h1>No categories yet</h1>
        <p>Create your first category to get started.</p>
        <NewCategoryForm />;
      </div>
    );
  }
  return <DashboardTabs categories={categories} ingredients={ingredients} />;
};

export default Dashboard;
