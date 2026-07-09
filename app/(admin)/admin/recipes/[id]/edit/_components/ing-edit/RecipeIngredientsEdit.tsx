import IconButton from "@/components/icon-button/IconButton";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecipeIngredientsEditor } from "@/hooks/useRecipeIngredientsEditor";
import { useSaveRecipeIngredients } from "@/hooks/useSaveRecipeIngredients";
import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { IRecipeIngredient } from "@/lib/types";
import { toast } from "sonner";
import IngredientCombobox from "./combobox/RecipeIngredientCombobox";
import RecipeIngredientRow from "./ing-row/RecipeInredientRow";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";

interface Props {
  recipe: IRecipe;
  allIngredients: IIngredient[];
}

export type IRecipeItem = IRecipeIngredient & {
  title: string;
};

const RecipeIngredientsEdit = ({ recipe, allIngredients }: Props) => {
  const { items, updateAmount, removeItem, addItem, reset, isAmountNotSet } =
    useRecipeIngredientsEditor(recipe);

  const handleCopyIngredients = async () => {
    const text = items
      .map(({ title, amount }) => `${title} - ${amount}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const { save, isPending } = useSaveRecipeIngredients(recipe.id);

  const availableIngredients = allIngredients.filter(
    (ing) => !items.some((t) => t.ingredientId === ing.id),
  );

  const onSubmit = () => {
    if (isAmountNotSet) {
      toast.error("Set all of the amounts!");
      return;
    }

    save(
      items.map((i) => ({
        ingredientId: i.ingredientId,
        amount: i.amount,
      })),
    );
  };

  return (
    <Card className={isPending ? "opacity-60 pointer-events-none" : ""}>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-center">
            Recipe ingredients ({items.length})
          </CardTitle>
          <IconButton
            variant="ghost"
            size="icon"
            onClick={handleCopyIngredients}
            label="Copy ingredients"
          >
            <Copy className="size-4" />
          </IconButton>
        </div>
      </CardHeader>
      <Separator />

      <CardContent className="space-y-4">
        <div className="flex flex-col w-full gap-4">
          {items.map((item) => (
            <RecipeIngredientRow
              key={item.ingredientId}
              item={item}
              onRemove={removeItem}
              onChangeAmount={updateAmount}
            />
          ))}
        </div>
        <div>
          <IngredientCombobox
            ingredients={availableIngredients}
            onSelect={addItem}
          />
        </div>
        <Separator />
        <div className="flex flex-col w-full gap-2">
          <Button disabled={isPending} variant="destructive" onClick={reset}>
            Reset
          </Button>

          <LoadingButton
            disabled={isAmountNotSet}
            onClick={onSubmit}
            isPending={isPending}
          >
            {isAmountNotSet ? "Set amounts!" : "Save"}
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeIngredientsEdit;
