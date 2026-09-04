import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Recipe from "./_components/Recipe";
import { getRecipeTitle } from "@/lib/actions/recipe.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipeId = Number((await params).id);
  const result = await getRecipeTitle(recipeId);

  if (!result.ok) {
    return {
      title: "Recipe",
      description: "Recipe details",
    };
  }

  return {
    title: result.data,
    description: `Details for ${result.data}`,
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
      <Recipe id={recipeId} />
    </main>
  );
};

export default RecipePage;
