import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import RecipeEdit from "./_components/RecipeEdit";
import { getRecipeTitle } from "@/lib/actions/recipe.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipeId = Number((await params).id);
  const result = await getRecipeTitle(recipeId);

  if (!result.ok) {
    return {
      title: "Edit recipe",
      description: "Edit recipe details",
    };
  }

  return {
    title: `${result.data}`,
    description: `Edit details for ${result.data}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const RecipeEditPage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.recipes.edit(recipeId)} />
      <RecipeEdit id={recipeId} />
    </main>
  );
};

export default RecipeEditPage;
