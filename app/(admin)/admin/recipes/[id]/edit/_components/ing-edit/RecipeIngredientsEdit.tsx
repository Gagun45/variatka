import { Card, CardContent } from "@/components/ui/card";
import { useRecipeIngredientsEditor } from "@/hooks/useRecipeIngredientsEditor";
import { useSaveRecipeIngredients } from "@/hooks/useSaveRecipeIngredients";
import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import RecipeIngredientsActions from "./RecipeIngredientsActions";
import RecipeIngredientsHeader from "./RecipeIngredientsHeader";
import RecipeIngredientsList from "./RecipeIngredientsList";
import RecipeIngredientsToolbar from "./RecipeIngredientsToolbar";

interface Props {
  recipe: IRecipe;
  allIngredients: IIngredient[];
}

const RecipeIngredientsEdit = ({ recipe, allIngredients }: Props) => {
  const {
    items,
    updateAmount,
    removeItem,
    addItem,
    reset,
    toPayload,
    canSave,
    emptyAmountCount,
    isDirty,
  } = useRecipeIngredientsEditor(recipe);
  const { save, isPending } = useSaveRecipeIngredients(recipe.id);

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

  const onSubmit = () => {
    if (emptyAmountCount > 0) {
      toast.error("Set all of the amounts!");
      return;
    }

    if (!isDirty) {
      toast.message("No ingredient changes to save");
      return;
    }

    save(toPayload());
  };

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
        />
      </CardContent>

      <RecipeIngredientsActions
        canSave={canSave}
        isDirty={isDirty}
        isPending={isPending}
        onReset={reset}
        onSave={onSubmit}
      />
    </Card>
  );
};

export default RecipeIngredientsEdit;
