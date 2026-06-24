import SavedRecipes from "./_components/SavedRecipes";

export const metadata = {
  title: "Saved recipes",
};

const SavedRecipesPage = () => {
  return (
    <main>
      <h1>Saved recipes</h1>
      <SavedRecipes />
    </main>
  );
};

export default SavedRecipesPage;
