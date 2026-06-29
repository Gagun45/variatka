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
  return (
    <Card className="w-full py-2">
      <CardContent className="flex justify-between gap-4 px-4  h-full">
        <div className="min-w-0 flex-1 flex-col flex justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 items-center">
              <Link
                href={frontendUrls.ingredients.view(id)}
                className="break-all text-base font-medium hover:underline"
              >
                {title}
              </Link>
            </div>

            <Button
              onClick={() =>
                isAdded
                  ? removeItem(id)
                  : addItem({
                      ...ingredient,
                      amount: "",
                    })
              }
              variant={isAdded ? "success" : "outline"}
            >
              {isAdded ? <CheckIcon /> : <PlusIcon />}
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <SaveToggleButton isSaved={isSaved} onToggle={onToggleSaved} />

            <StockBadge isInStock={isInStock} onClick={onToggleStock} />

            <Badge variant={"secondary"}>
              {Icon && <Icon className={iconClassName} />}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Used in {ingredient._count.recipeIngredients} recipes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientCard;
