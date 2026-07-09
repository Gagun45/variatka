import IconButton from "@/components/icon-button/IconButton";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
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
    <div className="flex items-center gap-2 border px-2 py-1 flex-wrap rounded-md">
      <div className="flex-1">{item.title}</div>
      <div className="flex gap-2 ml-auto">
        <Input
          value={item.amount}
          placeholder="Amount"
          className="w-24 shrink-0"
          onChange={(e) => onChangeAmount(item.ingredientId, e.target.value)}
        />

        <IconButton
          variant="destructive"
          size="icon"
          onClick={() => onRemove(item.ingredientId)}
          label={`Remove ${item.title}`}
          title="Remove ingredient"
        >
          <X className="size-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default RecipeIngredientRow;
