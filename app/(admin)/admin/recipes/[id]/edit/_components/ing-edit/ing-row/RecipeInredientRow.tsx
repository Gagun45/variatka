import IconButton from "@/components/icon-button/IconButton";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRecipeIngredientEditorItem } from "@/lib/types";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

type RecipeIngredientRowProps = {
  item: IRecipeIngredientEditorItem;
  index: number;
  disabled?: boolean;
  onChangeAmount: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  onSavedToggle: () => void;
  onStockToggle: () => void;
};

const RecipeIngredientRow = ({
  item,
  index,
  disabled,
  onChangeAmount,
  onRemove,
  onSavedToggle,
  onStockToggle,
}: RecipeIngredientRowProps) => {
  const isInvalid = !item.amount.trim();

  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)] gap-2 rounded-lg border bg-background p-2 md:grid-cols-[2rem_minmax(0,1fr)_minmax(8rem,11rem)_6rem_2rem_2rem] md:items-center",
        isInvalid && "border-destructive/50 bg-destructive/5",
      )}
    >
      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        {index + 1}
      </div>

      <div className="min-w-0">
        <Link
          href={frontendUrls.ingredients.edit(item.ingredientId)}
          className="block truncate font-medium hover:underline"
        >
          {item.title}
        </Link>
        {isInvalid ? (
          <div className="text-xs text-destructive">Amount is required</div>
        ) : null}
      </div>

      <div className="col-span-2 flex gap-2 md:col-span-1">
        <Input
          value={item.amount}
          placeholder="Amount"
          aria-invalid={isInvalid}
          disabled={disabled}
          className="h-9"
          onChange={(e) => onChangeAmount(item.ingredientId, e.target.value)}
        />
      </div>

      <div className="col-start-2 flex justify-self-end md:col-start-auto md:contents">
        <StockBadge isInStock={item.isInStock} onClick={onStockToggle} />
        <SaveToggleButton isSaved={item.isSaved} onToggle={onSavedToggle} />
        <IconButton
          variant="destructive"
          size="icon"
          disabled={disabled}
          onClick={() => onRemove(item.ingredientId)}
          label={`Remove ${item.title}`}
          title="Remove ingredient"
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default RecipeIngredientRow;
