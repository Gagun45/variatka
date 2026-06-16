import IngredientEdit from "./_components/IngredientEdit";

interface Props {
  params: Promise<{ id: string }>;
}

const EditIngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main className="space-y-8">
      <IngredientEdit id={ingredientId} />
    </main>
  );
};

export default EditIngredientPage;
