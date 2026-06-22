import { IIngredient } from "@/lib/prisma.args";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ImageViewPublic from "@/components/img-upload/ImageViewPublic";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { frontendUrls } from "@/lib/urls";
import { useAuthStore } from "@/zustand/auth.store";
import { useRecipeStore } from "@/zustand/recipe.store";
import Link from "next/link";
import IngredientImageViewAdmin from "./img-admin/IngredientImageViewAdmin";

interface Props {
  ingredient: IIngredient;
}

const IngredientView = ({ ingredient }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const {
    description,
    title,
    category,
    isInStock,
    id,
    imageKey,
    imageVersion,
  } = ingredient;
  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {isAdmin ? (
        <IngredientImageViewAdmin ingredient={ingredient} />
      ) : (
        <ImageViewPublic
          imageVersion={imageVersion}
          imageKey={imageKey}
          title={title}
        />
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-xl">{title}</CardTitle>

        <StockBadge isInStock={isInStock} />
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
        {isAdmin && (
          <>
            <Link
              className={buttonVariants({ className: "px-8 text-base!" })}
              href={frontendUrls.ingredients.edit(id)}
            >
              Edit
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
              variant={isAdded ? "outline" : "secondary"}
            >
              {isAdded ? "Remove from recipe" : "Add to recipe"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IngredientView;
