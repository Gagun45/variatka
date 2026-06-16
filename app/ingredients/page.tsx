import Link from "next/link";
import Dashboard from "./_components/dashboard/Dashboard";
import { buttonVariants } from "@/components/ui/button";

const IngredientsPage = () => {
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl tracking-widest font-bold">Ingredients</h1>

        <Link href="/recipes" className={buttonVariants()}>
          Recipes →
        </Link>
      </div>
      <Dashboard />
    </main>
  );
};

export default IngredientsPage;
