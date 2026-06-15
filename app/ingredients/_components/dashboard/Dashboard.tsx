import { getCategories, getIngredients } from "@/lib/actions";
import DashboardTabs from "./tabs/DashboardTabs";

const Dashboard = async () => {
  const categories = await getCategories();
  const ingredients = await getIngredients();
  return <DashboardTabs categories={categories} ingredients={ingredients} />;
};

export default Dashboard;
