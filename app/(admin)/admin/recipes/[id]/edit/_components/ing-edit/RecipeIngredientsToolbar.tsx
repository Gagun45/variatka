import IconButton from "@/components/icon-button/IconButton";
import { IIngredient } from "@/lib/prisma.args";
import { ClipboardCopy } from "lucide-react";
import IngredientCombobox from "./combobox/RecipeIngredientCombobox";

type IngredientOption = Pick<IIngredient, "id" | "title">;

type RecipeIngredientsToolbarProps = {
  availableIngredients: IIngredient[];
  hasSelectedItems: boolean;
  disabled?: boolean;
  onAdd: (ingredient: IngredientOption) => void;
  onCopy: () => void;
};

const RecipeIngredientsToolbar = ({
  availableIngredients,
  hasSelectedItems,
  disabled,
  onAdd,
  onCopy,
}: RecipeIngredientsToolbarProps) => {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <IngredientCombobox
        ingredients={availableIngredients}
        disabled={disabled}
        onSelect={onAdd}
      />

      <IconButton
        variant="outline"
        size="icon"
        disabled={disabled || !hasSelectedItems}
        onClick={onCopy}
        label="Copy ingredients"
      >
        <ClipboardCopy className="size-4" />
      </IconButton>
    </div>
  );
};

export default RecipeIngredientsToolbar;
