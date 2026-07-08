import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IRecipeIngredientItem, useRecipeStore } from "@/zustand/recipe.store";
import { Check, Hash, X } from "lucide-react";

interface Props {
  item: IRecipeIngredientItem;
}

const RecipeItemCard = ({ item }: Props) => {
  const { id, title, amount } = item;
  const updateAmount = useRecipeStore((state) => state.updateAmount);
  const removeItem = useRecipeStore((s) => s.removeItem);
  const suggestionsId = `quantity-suggestions-${id}`;
  const hasAmount = Boolean(amount);

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Label
              htmlFor={id.toString()}
              className="line-clamp-2 text-sm font-medium leading-snug"
            >
              {title}
            </Label>

            <Badge
              variant={hasAmount ? "secondary" : "outline"}
              className="shrink-0 gap-1 text-[11px]"
            >
              {hasAmount ? (
                <Check className="size-3" />
              ) : (
                <Hash className="size-3" />
              )}
              {hasAmount ? "Amount set" : "Needs amount"}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              id={id.toString()}
              type="text"
              list={suggestionsId}
              placeholder="e.g. 200 g"
              value={amount}
              onChange={(e) => updateAmount(id, e.target.value)}
              className="h-9"
            />
            <datalist id={suggestionsId}>
              <option value="0.25" />
              <option value="0.5" />
              <option value="0.75" />
              <option value="1" />
              <option value="2" />
              <option value="3" />
              <option value="5" />
            </datalist>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mr-1 -mt-1 size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => removeItem(id)}
          aria-label={`Remove ${title}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecipeItemCard;
