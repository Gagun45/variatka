import Ingredient from "./_components/Ingredient";

interface Props {
  params: Promise<{ id: string }>;
}

const IngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main className="space-y-8">
      <Ingredient id={ingredientId} />
    </main>
  );
};

export default IngredientPage;
