import Link from "next/link";
import RecipeDashboard from "./_components/recipes/RecipeDashboard";
import { buttonVariants } from "@/components/ui/button";

const RecipesPage = () => {
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl tracking-widest font-bold">Recipes</h1>

        <Link href="/ingredients" className={buttonVariants()}>
          Ingredients →
        </Link>
      </div>
      <RecipeDashboard />
    </main>
  );
};

export default RecipesPage;
