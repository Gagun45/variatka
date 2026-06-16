import { IIngredient } from "@/lib/prisma.args";
import IngredientCard from "./card/IngredientCard";
import { useIngredientPagePrefetch } from "@/hooks/prefetch/useIngredientPrefetch";

interface Props {
  ingredients: IIngredient[];
}

const IngredienstList = ({ ingredients }: Props) => {
  const { prefetchIngredientPage } = useIngredientPagePrefetch();
  return (
    <div className="flex flex-wrap gap-4 py-2">
      {ingredients.map((ing) => (
        <IngredientCard
          key={ing.id}
          ingredient={ing}
          onPrefetch={() => prefetchIngredientPage(ing.id)}
        />
      ))}
    </div>
  );
};

export default IngredienstList;
