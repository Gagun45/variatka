import { getPublicRecipeMetadata } from "@/lib/actions/recipe.actions";
import type { Metadata } from "next";
import PublicRecipe from "./_components/PublicRecipe";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipeId = Number((await params).id);
  const result = await getPublicRecipeMetadata(recipeId);

  if (!result.ok) {
    return {
      title: "Recipe",
      description: "Recipe details",
    };
  }

  return {
    title: result.data.title,
    description: result.data.description,
  };
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
