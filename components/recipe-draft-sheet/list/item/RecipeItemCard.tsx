import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IRecipeIngredientItem, useRecipeStore } from "@/prisma/store/recipe";
import { X } from "lucide-react";

interface Props {
  item: IRecipeIngredientItem;
}

const RecipeItemCard = ({ item }: Props) => {
  const { ingredient, amount } = item;
  const updateAmount = useRecipeStore((state) => state.updateAmount);
  const removeItem = useRecipeStore((s) => s.removeItem);
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0 flex-1">
          <Label
            htmlFor={`${ingredient.id}`}
            className="text-sm font-medium break-all"
          >
            {item.ingredient.name}
          </Label>
        </div>

        <Input
          id={`${ingredient.id}`}
          type="text"
          placeholder="e.g. 200 g"
          value={amount}
          onChange={(e) => updateAmount(ingredient.id, e.target.value)}
          className="w-28 text-right"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => removeItem(ingredient.id)}
          aria-label={`Remove ${item.ingredient.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeItemCard;
