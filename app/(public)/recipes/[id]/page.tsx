import PublicRecipe from "./_components/PublicRecipe";

interface Props {
  params: Promise<{ id: string }>;
}

const PublicRecipePage = async ({ params }: Props) => {
  const { id } = await params;

  return (
    <main>
      <PublicRecipe id={Number(id)} />
    </main>
  );
};

export default PublicRecipePage;
