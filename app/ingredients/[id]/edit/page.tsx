import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import IngredientEdit from "./_components/IngredientEdit";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";

interface Props {
  params: Promise<{ id: string }>;
}

const EditIngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main className="space-y-8">
      <PageBreadcrumb items={BREADCRUMB_ITEMS.ingredients.edit(ingredientId)} />
      <IngredientEdit id={ingredientId} />
    </main>
  );
};

export default EditIngredientPage;
