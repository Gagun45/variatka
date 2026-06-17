import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IRecipeIngredientItem, useRecipeStore } from "@/zustand/recipe";
import { X } from "lucide-react";

interface Props {
  item: IRecipeIngredientItem;
}

const RecipeItemCard = ({ item }: Props) => {
  const { id, title, amount } = item;
  const updateAmount = useRecipeStore((state) => state.updateAmount);
  const removeItem = useRecipeStore((s) => s.removeItem);
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2 p-2">
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <Label
            htmlFor={id.toString()}
            className="text-sm font-medium break-all"
          >
            {title}
          </Label>

          <Input
            id={id.toString()}
            type="text"
            list="quantity-suggestions"
            placeholder="e.g. 200 g"
            value={amount}
            onChange={(e) => updateAmount(id, e.target.value)}
            className="w-full"
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
        </div>

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
