import Link from "next/link";
import Dashboard from "./_components/dashboard/IngredientsDashboard";
import { buttonVariants } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";

export const metadata = {
  title: "Ingredients",
};

const IngredientsPage = () => {
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl tracking-widest font-bold">Ingredients</h1>

        <Link href={frontendUrls.recipes.index} className={buttonVariants()}>
          Recipes →
        </Link>
      </div>
      <Dashboard />
    </main>
  );
};

export default IngredientsPage;
