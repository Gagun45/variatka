import { IRecipeIngredientEditorItem } from "@/lib/types";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import RecipeIngredientRow from "./ing-row/RecipeInredientRow";

type RecipeIngredientsListProps = {
  items: IRecipeIngredientEditorItem[];
  disabled?: boolean;
  onRemove: (id: number) => void;
  onChangeAmount: (id: number, value: string) => void;
  onChangeSaved: (id: number, isSaved: boolean) => void;
  onChangeStock: (id: number, isInStock: boolean) => void;
};

const RecipeIngredientsList = ({
  items,
  disabled,
  onRemove,
  onChangeAmount,
  onChangeSaved,
  onChangeStock,
}: RecipeIngredientsListProps) => {
  const { mutate: mutateSaved } = useToggleSavedIngredient();
  const { mutate: mutateStock } = useToggleIngredientStock();

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
          mutateSaved(
            { ingredientId: item.ingredientId, isSaved: item.isSaved },
            {
              onError: () => onChangeSaved(item.ingredientId, item.isSaved),
            },
          );
        };
        const handleStockToggle = () => {
          onChangeStock(item.ingredientId, !item.isInStock);
          mutateStock(
            { ingredientId: item.ingredientId, isInStock: item.isInStock },
            {
              onError: () =>
                onChangeStock(item.ingredientId, item.isInStock),
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
            onStockToggle={handleStockToggle}
          />
        );
      })}
    </div>
  );
};

export default RecipeIngredientsList;
