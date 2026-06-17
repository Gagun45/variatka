import { useAuth } from "@/hooks/useIsAdmin";
import { IIngredient } from "@/lib/prisma.args";
import IngredientCard from "./card/IngredientCard";

interface Props {
  ingredients: IIngredient[];
}

const IngredienstList = ({ ingredients }: Props) => {
  const { isAdmin } = useAuth();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ingredients.map((ing) => (
        <IngredientCard isAdmin={isAdmin} key={ing.id} ingredient={ing} />
      ))}
    </div>
  );
};

export default IngredienstList;
