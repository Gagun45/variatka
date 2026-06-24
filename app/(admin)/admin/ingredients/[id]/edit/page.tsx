import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import IngredientEdit from "./_components/IngredientEdit";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return {
    title: `Edit Ingredient ${id}`,
    description: `Edit details for ingredient ${id}`,
  };
}

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
