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
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.map((item) => (
          <RecipeIngredientRow
            key={item.ingredientId}
            item={item}
            onRemove={removeItem}
            onChangeAmount={updateAmount}
          />
        ))}

        <IngredientCombobox
          ingredients={availableIngredients}
          onSelect={addItem}
        />
      </CardContent>

      <Button variant="destructive" onClick={reset}>
        Reset
      </Button>

      <LoadingButton
        disabled={isAmountNotSet}
        onClick={onSubmit}
        isPending={isPending}
      >
        {isAmountNotSet ? "Set amounts!" : "Save"}
      </LoadingButton>
    </Card>
  );
};

export default RecipeIngredientsEdit;
