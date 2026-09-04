import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import Ingredient from "./_components/Ingredient";
import { getIngredientTitle } from "@/lib/actions/ingredient.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ingredientId = Number((await params).id);
  const result = await getIngredientTitle(ingredientId);

  if (!result.ok) {
    return {
      title: "Ingredient",
      description: "Ingredient details",
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
