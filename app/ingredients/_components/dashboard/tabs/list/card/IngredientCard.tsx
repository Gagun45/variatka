import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToggleMyIngredient } from "@/features/ingredient/hooks/useToggleMyIngredient";
import { IIngredient } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/prisma/store/recipe";
import clsx from "clsx";
import { CheckIcon, Heart, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  ingredient: IIngredient;
}

const IngredientCard = ({ ingredient }: Props) => {
  const { title, isInStock, id, isAdded: isFavorited } = ingredient;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );
  const { mutate } = useToggleMyIngredient();
  const onToggle = () => {
    mutate({ ingredientId: id, isAdded: isFavorited });
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

          <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
            <Button
              onClick={onToggle}
              variant="ghost"
              size="icon"
              className="group shrink-0 rounded-full hover:bg-red-50"
            >
              <Heart
                className={clsx(
                  "size-5 transition-all duration-200 group-hover:scale-110",
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground group-hover:text-red-500",
                )}
              />
            </Button>
            <Badge variant={isInStock ? "outline" : "destructive"}>
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
