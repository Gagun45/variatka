import { Separator } from "@/components/ui/separator";
import Ingredient from "./_components/Ingredient";
import IngredientRecipes from "./_components/recipes/IngredientRecipes";

interface Props {
  params: Promise<{ id: string }>;
}

const IngredientPage = async ({ params }: Props) => {
  const { id } = await params;
  const ingredientId = +id;
  return (
    <main className="space-y-8">
      <Ingredient id={ingredientId} />
      <Separator />
      <IngredientRecipes id={ingredientId} />
    </main>
  );
};

export default IngredientPage;
