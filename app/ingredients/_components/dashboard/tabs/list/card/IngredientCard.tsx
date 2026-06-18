import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IIngredient } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/zustand/recipe";
import { CheckIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import StockToggleButton from "./toggle-stock-btn/StockToggleButton";

interface Props {
  ingredient: IIngredient;
  onSavedToggle: (value: { ingredientId: number; isSaved: boolean }) => void;
  onStockToggle: (value: { ingredientId: number; isInStock: boolean }) => void;
  isAdmin?: boolean;
}

const IngredientCard = ({
  ingredient,
  isAdmin,
  onSavedToggle,
  onStockToggle,
}: Props) => {
  const { title, isInStock, id, isSaved } = ingredient;

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
            <Link
              href={frontendUrls.ingredients.view(id)}
              className="break-all text-base font-medium hover:underline"
            >
              {title}
            </Link>

            {isAdmin && (
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
            )}
          </div>

          <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
            {isAdmin && (
              <SaveToggleButton isSaved={isSaved} onToggle={onToggleSaved} />
            )}

            {isAdmin && (
              <StockToggleButton
                className="cursor-pointer"
                isInStock={isInStock}
                onToggle={onToggleStock}
              />
            )}
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
