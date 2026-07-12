import { Card, CardContent } from "@/components/ui/card";
import { IIngredient } from "@/lib/prisma.args";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useRecipeIngredientsEditor } from "@/hooks/useRecipeIngredientsEditor";
import RecipeIngredientsHeader from "./RecipeIngredientsHeader";
import RecipeIngredientsList from "./RecipeIngredientsList";
import RecipeIngredientsToolbar from "./RecipeIngredientsToolbar";

interface Props {
  allIngredients: IIngredient[];
  editor: ReturnType<typeof useRecipeIngredientsEditor>;
  isPending: boolean;
}

const RecipeIngredientsEdit = ({ allIngredients, editor, isPending }: Props) => {
  const {
    items,
    updateAmount,
    updateSaved,
    updateStock,
    removeItem,
    addItem,
    emptyAmountCount,
    isDirty,
  } = editor;

  const handleCopyIngredients = async () => {
    const text = items
      .map(({ title, amount }) => `${title} - ${amount.trim()}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const availableIngredients = allIngredients.filter(
    (ing) => !items.some((t) => t.ingredientId === ing.id),
  );

  return (
    <Card className={isPending ? "opacity-75" : ""}>
      <RecipeIngredientsHeader
        selectedCount={items.length}
        availableCount={availableIngredients.length}
        emptyAmountCount={emptyAmountCount}
        isDirty={isDirty}
      />
      <Separator />

      <CardContent className="space-y-4 p-4 sm:p-6">
        <RecipeIngredientsToolbar
          availableIngredients={availableIngredients}
          hasSelectedItems={items.length > 0}
          disabled={isPending}
          onAdd={addItem}
          onCopy={handleCopyIngredients}
        />

        <RecipeIngredientsList
          items={items}
          disabled={isPending}
          onRemove={removeItem}
          onChangeAmount={updateAmount}
          onChangeSaved={updateSaved}
          onChangeStock={updateStock}
        />
      </CardContent>
    </Card>
  );
};

export default RecipeIngredientsEdit;
