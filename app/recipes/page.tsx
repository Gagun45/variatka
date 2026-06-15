import { getRecipes } from "@/lib/actions";
import Recipes from "./_components/recipes/Recipes";

const RecipesPage = async () => {
  const recipes = await getRecipes();
  return (
    <main>
      <h1 className="text-center">Recipes</h1>
      <Recipes recipes={recipes} />
    </main>
  );
};

export default RecipesPage;
