import Image from "next/image";
import { IIngredient } from "@/lib/prisma.args";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/prisma/store/recipe";

interface Props {
  ingredient: IIngredient;
}

const IngredientView = ({ ingredient }: Props) => {
  const { description, title, category, isInStock, id } = ingredient;
  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.ingredient.id === id),
  );

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Image */}
      <div className="relative w-full h-96">
        <Image
          src="/default-poster.jpg"
          alt={title}
          fill
          className="object-contain"
        />
      </div>

      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-xl">{title}</CardTitle>

        <Badge variant={isInStock ? "default" : "destructive"}>
          {isInStock ? "In stock" : "Out of stock"}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="text-sm text-muted-foreground">
          Category:{" "}
          <span className="text-foreground font-medium">{category.title}</span>
        </div>

        <Separator />

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Link
          className={buttonVariants({ className: "px-8 text-base!" })}
          href={frontendUrls.ingredients.edit(id)}
        >
          Edit
        </Link>
        <Button
          onClick={() =>
            isAdded ? removeItem(id) : addItem({ ingredient, amount: "" })
          }
          variant={isAdded ? "destructive" : "success"}
        >
          {isAdded ? "Remove from recipe" : "Add to recipe"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IngredientView;
