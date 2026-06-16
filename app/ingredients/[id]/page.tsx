import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Ingredient from "./_components/Ingredient";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

interface Props {
  params: Promise<{ id: string }>;
}

const IngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main className="space-y-8">
      <PageBreadcrumb items={BREADCRUMB_ITEMS.ingredients.view(ingredientId)} />
      <Ingredient id={ingredientId} />
    </main>
  );
};

export default IngredientPage;
