import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IRecipeItem } from "../RecipeIngredientsEdit";

type RecipeIngredientRowProps = {
  item: IRecipeItem;
  onChangeAmount: (id: number, value: string) => void;
  onRemove: (id: number) => void;
};

const RecipeIngredientRow = ({
  item,
  onChangeAmount,
  onRemove,
}: RecipeIngredientRowProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{item.title}</div>

      <Input
        value={item.amount}
        placeholder="Amount"
        className="w-24 shrink-0"
        onChange={(e) => onChangeAmount(item.ingredientId, e.target.value)}
      />

      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(item.ingredientId)}
      >
        ✕
      </Button>
    </div>
  );
};

export default RecipeIngredientRow;
