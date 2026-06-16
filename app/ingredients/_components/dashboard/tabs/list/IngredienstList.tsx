import { IIngredient } from "@/lib/prisma.args";
import IngredientCard from "./card/IngredientCard";

interface Props {
  ingredients: IIngredient[];
}

const IngredienstList = ({ ingredients }: Props) => {
  return (
    <div className="flex flex-wrap gap-4 py-2">
      {ingredients.map((ing) => (
        <IngredientCard key={ing.id} ingredient={ing} />
      ))}
    </div>
  );
};

export default IngredienstList;
