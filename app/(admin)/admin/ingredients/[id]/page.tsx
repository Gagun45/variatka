import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Ingredient from "./_components/Ingredient";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stuffId = (await params).id;

  return {
    title: `Ingredient ${stuffId}`,
    description: `Details for ingredient ${stuffId}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const IngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.ingredients.view(ingredientId)} />
      <Ingredient id={ingredientId} />
    </main>
  );
};

export default IngredientPage;
