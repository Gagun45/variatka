import { IRecipeIngredientItem } from "@/zustand/recipe";
import RecipeItemCard from "./item/RecipeItemCard";
interface Props {
  items: IRecipeIngredientItem[];
}

const RecipeItemsList = ({ items }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <RecipeItemCard item={item} key={item.id} />
      ))}
    </div>
  );
};

export default RecipeItemsList;
