import PublicRecipe from "./_components/public/PublicRecipe";

interface Props {
  params: Promise<{ id: string }>;
}

const PublicRecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main className="!max-w-none !space-y-0 !px-0 !py-0">
      <PublicRecipe id={recipeId} />
    </main>
  );
};

export default PublicRecipePage;
