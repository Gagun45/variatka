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
  const {
    ingredient: { id, title },
    amount,
  } = item;
  const updateAmount = useRecipeStore((state) => state.updateAmount);
  const removeItem = useRecipeStore((s) => s.removeItem);
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0 flex-1">
          <Label
            htmlFor={id.toString()}
            className="text-sm font-medium break-all"
          >
            {title}
          </Label>
        </div>

        <Input
          id={id.toString()}
          type="text"
          list="quantity-suggestions"
          placeholder="e.g. 200 g"
          value={amount}
          onChange={(e) => updateAmount(id, e.target.value)}
          className="w-28 text-right"
        />
        <datalist id="quantity-suggestions">
          <option value="0.25" />
          <option value="0.5" />
          <option value="0.75" />
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="5" />
        </datalist>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => removeItem(id)}
          aria-label={`Remove ${title}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeItemCard;
