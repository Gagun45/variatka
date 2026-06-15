import { Button } from "@/components/ui/button";
import { IIngredient } from "@/lib/prisma.args";
import { useRecipeStore } from "@/prisma/store/recipe";

interface Props {
  ingredient: IIngredient;
}

const IngredientCard = ({ ingredient }: Props) => {
  const { name, description, isInStock, id } = ingredient;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.ingredient.id === id),
  );

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);
  return (
    <div className="flex flex-col gap-2 bg-gray-500">
      <span>Name: {name}</span>
      <span>Description: {description}</span>
      <span>Is in stock: {isInStock ? "Yes" : "No"}</span>
      <Button
        onClick={() =>
          isAdded ? removeItem(id) : addItem({ ingredient, amount: "" })
        }
        className={`mt-2 px-3 py-1 rounded text-white ${
          isAdded
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isAdded ? "Remove" : "Add"}
      </Button>
    </div>
  );
};

export default IngredientCard;
