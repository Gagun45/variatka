import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateRecipeIngredients } from "@/features/recipe/hooks/useUpdateRecipeIngredients";
import { IIngredient, IRecipe } from "@/lib/prisma.args";
import { IRecipeIngredient } from "@/lib/types";
import { useState } from "react";
import IngredientCombobox from "./combobox/RecipeIngredientCombobox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { frontendUrls } from "@/lib/urls";
import RecipeIngredientRow from "./ing-row/RecipeInredientRow";

interface Props {
  recipe: IRecipe;
  allIngredients: IIngredient[];
}

export type IRecipeItem = IRecipeIngredient & {
  title: string;
};

const RecipeIngredientsEdit = ({ recipe, allIngredients }: Props) => {
  const { ingredients } = recipe;
  const router = useRouter();
  const { mutate } = useUpdateRecipeIngredients();
  const initialItems: IRecipeItem[] = ingredients.map((ing) => ({
    amount: ing.amount,
    ingredientId: ing.ingredientId,
    title: ing.ingredient.title,
  }));
  const [items, setItems] = useState<IRecipeItem[]>(initialItems);
  const isAmountNotSet = items.some((i) => !i.amount);

  const updateAmount = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.ingredientId === id ? { ...i, amount: value } : i)),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.ingredientId !== id));
  };

  const onCancel = () => setItems(initialItems);
  const onSubmit = () => {
    if (isAmountNotSet) {
      toast.error("Set all of the amounts!");
      return;
    }
    mutate(
      {
        recipeId: recipe.id,
        items: items.map((i) => ({
          amount: i.amount,
          ingredientId: i.ingredientId,
        })),
      },
      {
        onSuccess: () => {
          router.push(frontendUrls.recipes.view(recipe.id));
          toast.success("Recipe edited!");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
  };

  return (
    <Card>
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
          ingredients={allIngredients.filter(
            (ing) => !items.some((t) => t.ingredientId === ing.id),
          )}
          onSelect={(ingredient) => {
            setItems((prev) => {
              if (prev.some((i) => i.ingredientId === ingredient.id)) {
                return prev;
              }

              return [
                ...prev,
                {
                  ingredientId: ingredient.id,
                  title: ingredient.title,
                  amount: "",
                },
              ];
            });
          }}
        />
      </CardContent>
      <Button variant={"destructive"} onClick={onCancel}>
        Cancel
      </Button>
      <Button disabled={isAmountNotSet} onClick={onSubmit}>
        Save
      </Button>
    </Card>
  );
};

export default RecipeIngredientsEdit;
