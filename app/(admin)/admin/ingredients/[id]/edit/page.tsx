import PageBreadcrumb from "@/components/bread/PageBreadcrumb";
import IngredientEdit from "./_components/IngredientEdit";
import { getIngredientTitle } from "@/lib/actions/ingredient.actions";
import { BREADCRUMB_ITEMS } from "@/lib/constants/bread.constants";
import { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ingredientId = Number((await params).id);
  const result = await getIngredientTitle(ingredientId);

  if (!result.ok) {
    return {
      title: "Edit ingredient",
      description: "Edit ingredient details",
    };
  }

  return {
    title: result.data,
    description: `Edit details for ${result.data}`,
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const EditIngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main>
      <PageBreadcrumb items={BREADCRUMB_ITEMS.ingredients.edit(ingredientId)} />
      <IngredientEdit id={ingredientId} />
    </main>
  );
};

export default EditIngredientPage;
