import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Recipe from "./_components/Recipe";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

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
