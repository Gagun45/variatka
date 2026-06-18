import StockToggleButton from "@/app/ingredients/_components/dashboard/tabs/list/card/toggle-stock-btn/StockToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
  isAdmin?: boolean;
}

const RecipeIngredients = ({ recipe, isAdmin }: Props) => {
  const { mutate } = useToggleIngredientStock();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Ingredients
      </h3>

      <div className="flex flex-col gap-2">
        {recipe.ingredients.map((ing) => {
          const onStockToggle = () => {
            mutate({
              ingredientId: ing.ingredientId,
              isInStock: ing.ingredient.isInStock,
            });
          };
          return (
            <div
              key={ing.ingredientId}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border px-3 py-2"
            >
              <span className="font-medium truncate">
                {ing.ingredient.title}
              </span>

              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {ing.amount}
              </span>
              {isAdmin ? (
                <StockToggleButton
                  onToggle={onStockToggle}
                  isInStock={ing.ingredient.isInStock}
                />
              ) : (
                <StockBadge inInStock={ing.ingredient.isInStock} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeIngredients;
