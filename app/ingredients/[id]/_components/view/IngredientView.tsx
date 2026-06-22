import { IIngredient } from "@/lib/prisma.args";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import ImageViewPublic from "@/components/img-upload/ImageViewPublic";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { frontendUrls } from "@/lib/urls";
import { useAuthStore } from "@/zustand/auth.store";
import { useRecipeStore } from "@/zustand/recipe.store";
import Link from "next/link";
import IngredientImageViewAdmin from "./img-admin/IngredientImageViewAdmin";
import ViewItemCategory from "@/components/view-item/ViewItemCategory";
import ViewItemDescription from "@/components/view-item/ViewItemDescription";
import ViewItemEditLink from "@/components/view-item/ViewItemEditLink";

interface Props {
  ingredient: IIngredient;
}

const IngredientView = ({ ingredient }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { mutate } = useToggleSavedIngredient();
  const { mutate: stockMutate } = useToggleIngredientStock();
  const {
    description,
    title,
    category,
    isInStock,
    id,
    isSaved,
    imageKey,
    imageVersion,
  } = ingredient;
  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );

  const onToggleSaved = () => {
    mutate({ ingredientId: id, isSaved });
  };

  const onToggleStock = () => {
    stockMutate({
      ingredientId: id,
      isInStock,
    });
  };

  const removeItem = useRecipeStore((state) => state.removeItem);
  const addItem = useRecipeStore((state) => state.addItem);

  return (
    <Card>
      <CardHeader className="view-item-card-header">
        <div className="view-item-card-header-row">
          <ViewItemCategory categoryTitle={category.title} />
          <StockBadge
            isInStock={isInStock}
            onClick={isAdmin ? onToggleStock : undefined}
          />
        </div>
        <div className="view-item-card-header-row">
          <ViewItemDescription description={description} />
          {isAdmin && (
            <SaveToggleButton
              isSaved={ingredient.isSaved}
              onToggle={onToggleSaved}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="view-item-card-content">
        {isAdmin ? (
          <IngredientImageViewAdmin ingredient={ingredient} />
        ) : (
          <ImageViewPublic
            imageVersion={imageVersion}
            imageKey={imageKey}
            title={title}
          />
        )}

        <Separator />

        {isAdmin && (
          <>
            <ViewItemEditLink href={frontendUrls.ingredients.edit(id)} />

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
