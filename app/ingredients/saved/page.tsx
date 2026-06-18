import SavedIngredients from "./_components/SavedIngredients";

export const metadata = {
  title: "Saved ingredients",
};

const SavedIngredientsPage = () => {
  return (
    <main>
      <h1>Saved ingredients</h1>
      <SavedIngredients />
    </main>
  );
};

export default SavedIngredientsPage;
