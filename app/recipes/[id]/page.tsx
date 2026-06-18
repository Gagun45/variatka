import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Recipe from "./_components/Recipe";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return {
    title: `Recipe ${id}`,
    description: `Details for recipe ${id}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const RecipePage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.recipes.view(recipeId)} />
      <h1>Recipe page</h1>
      <Recipe id={recipeId} />
    </main>
  );
};

export default RecipePage;
