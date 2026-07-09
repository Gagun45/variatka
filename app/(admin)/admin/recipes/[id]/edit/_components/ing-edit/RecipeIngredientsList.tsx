import { IRecipeIngredientEditorItem } from "@/lib/types";
import RecipeIngredientRow from "./ing-row/RecipeInredientRow";

type RecipeIngredientsListProps = {
  items: IRecipeIngredientEditorItem[];
  disabled?: boolean;
  onRemove: (id: number) => void;
  onChangeAmount: (id: number, value: string) => void;
};

const RecipeIngredientsList = ({
  items,
  disabled,
  onRemove,
  onChangeAmount,
}: RecipeIngredientsListProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No ingredients selected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <RecipeIngredientRow
          key={item.ingredientId}
          item={item}
          index={index}
          disabled={disabled}
          onRemove={onRemove}
          onChangeAmount={onChangeAmount}
        />
      ))}
    </div>
  );
};

export default RecipeIngredientsList;
