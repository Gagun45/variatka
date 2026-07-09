import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INGREDIENT_CATEGORIES_DATA } from "@/lib/enumslist/ingredient.constants";
import { IIngredient } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/zustand/recipe.store";
import { CheckIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  ingredient: IIngredient;
  onSavedToggle: (value: { ingredientId: number; isSaved: boolean }) => void;
  onStockToggle: (value: { ingredientId: number; isInStock: boolean }) => void;
}

const IngredientCard = ({
  ingredient,
  onSavedToggle,
  onStockToggle,
}: Props) => {
  const { title, isInStock, id, isSaved, category } = ingredient;

  const { label, icon, iconClassName } = INGREDIENT_CATEGORIES_DATA[category];
  const Icon = icon;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );

  const onToggleStock = () => {
    onStockToggle({ ingredientId: id, isInStock });
  };

  const onToggleSaved = () => {
    onSavedToggle({ ingredientId: id, isSaved });
  };

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);

  const onToggleDraft = () => {
    if (isAdded) {
      removeItem(id);
      return;
    }

    addItem({
      ...ingredient,
      amount: "",
    });
  };

  return (
    <Card
      size="sm"
      className="w-full rounded-lg py-3 transition-colors hover:bg-muted/30"
    >
      <CardContent className="flex h-full flex-col gap-3 px-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Link
              href={frontendUrls.ingredients.view(id)}
              className="line-clamp-2 text-sm font-medium leading-5 hover:underline"
            >
              {title}
            </Link>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="max-w-full">
                {Icon && <Icon className={iconClassName} />}
                <span className="truncate">{label}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {ingredient._count.recipeIngredients} recipes
              </span>
            </div>
          </div>

          <Button
            onClick={onToggleDraft}
            variant={isAdded ? "success" : "outline"}
            size="icon-sm"
            className="shrink-0"
            aria-label={
              isAdded ? "Remove from recipe draft" : "Add to recipe draft"
            }
            title={isAdded ? "Remove from draft" : "Add to draft"}
          >
            {isAdded ? <CheckIcon /> : <PlusIcon />}
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
          <StockBadge
            isInStock={isInStock}
            onClick={onToggleStock}
            className="h-6"
          />
          <SaveToggleButton
            isSaved={isSaved}
            onToggle={onToggleSaved}
            className="size-7"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientCard;
