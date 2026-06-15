import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IIngredient } from "@/lib/prisma.args";
import { useRecipeStore } from "@/prisma/store/recipe";
import { Minus, MinusIcon, Plus, PlusIcon } from "lucide-react";

interface Props {
  ingredient: IIngredient;
}

const IngredientCard = ({ ingredient }: Props) => {
  const { title, isInStock, id } = ingredient;

  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.ingredient.id === id),
  );

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);
  return (
    <Card className="py-2">
      <CardContent className="flex items-center justify-between px-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-base">{title}</span>

          <Badge variant={isInStock ? "outline" : "default"}>
            {isInStock ? "In stock" : "Out of stock"}
          </Badge>
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
