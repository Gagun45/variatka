import PublicRecipe from "./_components/public/PublicRecipe";

interface Props {
  params: Promise<{ id: string }>;
}

const PublicRecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main>
      <PublicRecipe id={recipeId} />
    </main>
  );
};

export default PublicRecipePage;
