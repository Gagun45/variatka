import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToggleMyIngredient } from "@/features/ingredient/hooks/useToggleMyIngredient";
import { IIngredient } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/prisma/store/recipe";
import clsx from "clsx";
import { Heart, MinusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  ingredient: IIngredient;
}

const IngredientCard = ({ ingredient }: Props) => {
  const { title, isInStock, id, isAdded: isFavorited } = ingredient;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.ingredient.id === id),
  );
  const { mutate } = useToggleMyIngredient();
  const onToggle = () => {
    mutate({ ingredientId: id, isAdded: isFavorited });
  };

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);
  return (
    <Card className="py-2">
      <CardContent className="flex items-center justify-between px-4 gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href={frontendUrls.ingredients.view(id)}
            className="font-medium text-base hover:underline"
          >
            {title}
          </Link>

          <Badge variant={isInStock ? "outline" : "destructive"}>
            {isInStock ? "In stock" : "Out of stock"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {ingredient._count.recipeIngredients}
          </span>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="group rounded-full hover:bg-red-50"
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
        </div>

        <Button
          onClick={() =>
            isAdded ? removeItem(id) : addItem({ ingredient, amount: "" })
          }
          variant={isAdded ? "destructive" : "success"}
        >
          {isAdded ? <MinusIcon /> : <PlusIcon />}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IngredientCard;
