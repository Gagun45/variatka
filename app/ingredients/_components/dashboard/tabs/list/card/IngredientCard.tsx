import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IIngredient } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/zustand/recipe";
import clsx from "clsx";
import { CheckIcon, Heart, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  ingredient: IIngredient;
  onSavedToggle?: (value: { ingredientId: number; isSaved: boolean }) => void;
  isAdmin?: boolean;
}

const IngredientCard = ({ ingredient, isAdmin, onSavedToggle }: Props) => {
  const { title, isInStock, id, isSaved } = ingredient;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );

  const onToggle = () => {
    if (onSavedToggle) {
      onSavedToggle({ ingredientId: id, isSaved });
    } else return;
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
            {isAdmin && onSavedToggle && (
              <SaveToggleButton isSaved={isSaved} onToggle={onToggle} />
            )}
            <Badge variant={isInStock ? "default" : "destructive"}>
              {isInStock ? "In stock" : "Out of stock"}
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
