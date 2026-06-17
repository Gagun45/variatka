import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import RecipeEdit from "./_components/RecipeEdit";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

interface Props {
  params: Promise<{ id: string }>;
}

const RecipeEditPage = async ({ params }: Props) => {
  const { id } = await params;
  const recipeId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.recipes.edit(recipeId)} />
      <h1>Recipe edit</h1>
      <RecipeEdit id={recipeId} />
    </main>
  );
};

export default RecipeEditPage;
