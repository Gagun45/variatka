import RecipeDashboard from "./_components/recipes/RecipeDashboard";

export const metadata = {
  title: "Recipes",
};

const RecipesPage = () => {
  return (
    <main>
      <h1>Recipes</h1>
      <RecipeDashboard />
    </main>
  );
};

export default RecipesPage;
