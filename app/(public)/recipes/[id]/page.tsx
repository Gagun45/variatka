import { getPublicRecipeById } from "@/lib/data/public-recipes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicRecipeView from "./_components/public/view/PublicRecipeView";

interface Props {
  params: Promise<{ id: string }>;
}

const getRecipeFromParams = async (params: Props["params"]) => {
  const { id } = await params;
  return getPublicRecipeById(Number(id));
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipeFromParams(params);

  if (!recipe) return { title: "Recipe not found" };

  return {
    title: recipe.title,
    description: recipe.description || `View the ${recipe.title} recipe.`,
  };
}

const PublicRecipePage = async ({ params }: Props) => {
  const recipe = await getRecipeFromParams(params);
  if (!recipe) notFound();

  return (
    <main>
      <PublicRecipeView recipe={recipe} />
    </main>
  );
};

export default PublicRecipePage;
