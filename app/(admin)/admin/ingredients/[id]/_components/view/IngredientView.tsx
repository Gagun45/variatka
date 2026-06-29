import { IIngredient } from "@/lib/prisma.args";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ViewItemCategory from "@/components/view-item/ViewItemCategory";
import ViewItemDescription from "@/components/view-item/ViewItemDescription";
import ViewItemEditLink from "@/components/view-item/ViewItemEditLink";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { frontendUrls } from "@/lib/urls";
import { useRecipeStore } from "@/zustand/recipe.store";
import IngredientImageViewAdmin from "./img-admin/IngredientImageViewAdmin";
import { INGREDIENT_CATEGORIES_DATA } from "@/lib/enumslist/ingredient.constants";

interface Props {
  ingredient: IIngredient;
}

const IngredientView = ({ ingredient }: Props) => {
  const { mutate } = useToggleSavedIngredient();
  const { mutate: stockMutate } = useToggleIngredientStock();
  const { description, category, isInStock, id, isSaved } = ingredient;
  const isAdded = useRecipeStore((state) =>
    state.items.some((i) => i.id === id),
  );

  const categoryLabel = INGREDIENT_CATEGORIES_DATA[category].label;

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
          <ViewItemCategory categoryTitle={categoryLabel} />
          <StockBadge isInStock={isInStock} onClick={onToggleStock} />
        </div>
        <div className="view-item-card-header-row">
          <ViewItemDescription description={description} />

          <SaveToggleButton
            isSaved={ingredient.isSaved}
            onToggle={onToggleSaved}
          />
        </div>
      </CardHeader>

      <CardContent className="view-item-card-content">
        <IngredientImageViewAdmin ingredient={ingredient} />
        <ViewItemEditLink href={frontendUrls.ingredients.edit(id)} />

        <Separator />

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
      </CardContent>
    </Card>
  );
};

export default IngredientView;
