import IconButton from "@/components/icon-button/IconButton";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRecipeIngredientEditorItem } from "@/lib/types";

type RecipeIngredientRowProps = {
  item: IRecipeIngredientEditorItem;
  index: number;
  disabled?: boolean;
  onChangeAmount: (id: number, value: string) => void;
  onRemove: (id: number) => void;
};

const RecipeIngredientRow = ({
  item,
  index,
  disabled,
  onChangeAmount,
  onRemove,
}: RecipeIngredientRowProps) => {
  const isInvalid = !item.amount.trim();

  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)] gap-2 rounded-lg border bg-background p-2 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(9rem,14rem)_2rem] sm:items-center",
        isInvalid && "border-destructive/50 bg-destructive/5",
      )}
    >
      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        {index + 1}
      </div>

      <div className="min-w-0">
        <div className="truncate font-medium">{item.title}</div>
        {isInvalid ? (
          <div className="text-xs text-destructive">Amount is required</div>
        ) : null}
      </div>

      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <Input
          value={item.amount}
          placeholder="Amount"
          aria-invalid={isInvalid}
          disabled={disabled}
          className="h-9"
          onChange={(e) => onChangeAmount(item.ingredientId, e.target.value)}
        />
      </div>

      <IconButton
        variant="destructive"
        size="icon"
        disabled={disabled}
        onClick={() => onRemove(item.ingredientId)}
        label={`Remove ${item.title}`}
        title="Remove ingredient"
        className="col-start-2 justify-self-end sm:col-start-auto"
      >
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  );
};

export default RecipeIngredientRow;
