import RecipeEdit from "./_components/RecipeEdit";

interface Props {
  params: Promise<{ id: string }>;
}

const RecipeEditPage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main className="space-y-8">
      <RecipeEdit id={recipeId} />
    </main>
  );
};

export default RecipeEditPage;
