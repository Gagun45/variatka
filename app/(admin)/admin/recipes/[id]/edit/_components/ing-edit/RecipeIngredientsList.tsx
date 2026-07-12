import { IRecipeIngredientEditorItem } from "@/lib/types";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import RecipeIngredientRow from "./ing-row/RecipeInredientRow";

type RecipeIngredientsListProps = {
  items: IRecipeIngredientEditorItem[];
  disabled?: boolean;
  onRemove: (id: number) => void;
  onChangeAmount: (id: number, value: string) => void;
  onChangeSaved: (id: number, isSaved: boolean) => void;
};

const RecipeIngredientsList = ({
  items,
  disabled,
  onRemove,
  onChangeAmount,
  onChangeSaved,
}: RecipeIngredientsListProps) => {
  const { mutate } = useToggleSavedIngredient();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No ingredients selected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const handleSavedToggle = () => {
          onChangeSaved(item.ingredientId, !item.isSaved);
          mutate(
            { ingredientId: item.ingredientId, isSaved: item.isSaved },
            {
              onError: () => onChangeSaved(item.ingredientId, item.isSaved),
            },
          );
        };

        return (
          <RecipeIngredientRow
            key={item.ingredientId}
            item={item}
            index={index}
            disabled={disabled}
            onRemove={onRemove}
            onChangeAmount={onChangeAmount}
            onSavedToggle={handleSavedToggle}
          />
        );
      })}
    </div>
  );
};

export default RecipeIngredientsList;
