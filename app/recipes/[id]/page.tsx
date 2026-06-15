import Recipe from "./_components/Recipe";

interface Props {
  params: Promise<{ id: string }>;
}

const RecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main>
      <Recipe id={ingredientId} />
    </main>
  );
};

export default RecipePage;
