import Dashboard from "./_components/dashboard/IngredientsDashboard";

export const metadata = {
  title: "Ingredients",
};

const IngredientsPage = () => {
  return (
    <main>
      <h1>Ingredients</h1>

      <Dashboard />
    </main>
  );
};

export default IngredientsPage;
