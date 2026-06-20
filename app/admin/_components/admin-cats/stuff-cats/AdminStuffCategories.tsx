import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import { useStuff } from "@/features/stuff/hooks/useStuff";
import AdminStuffCategoriesList from "./list/AdminStuffCategoriesList";

const AdminStuffCategories = () => {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useStuffCategories();

  const {
    data: stuff,
    isLoading: stuffLoading,
    isError: stuffError,
  } = useStuff();

  if (categoriesLoading || stuffLoading) return <Loader />;
  if (categoriesError || stuffError || !categories || !stuff) {
    return <StateScreen />;
  }

  return <AdminStuffCategoriesList categories={categories} stuff={stuff} />;
};

export default AdminStuffCategories;
