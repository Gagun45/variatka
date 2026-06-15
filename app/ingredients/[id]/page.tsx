import Ingredient from "./_components/Ingredient";
import IngredientRecipes from "./_components/recipes/IngredientRecipes";

interface Props {
  params: Promise<{ id: string }>;
}

const IngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main>
      <Ingredient id={ingredientId} />
      <IngredientRecipes id={ingredientId} />
    </main>
  );
};

export default IngredientPage;
