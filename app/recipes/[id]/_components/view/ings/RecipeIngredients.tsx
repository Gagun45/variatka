import StockToggleButton from "@/app/ingredients/_components/dashboard/tabs/list/card/toggle-stock-btn/StockToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

interface Props {
  recipe: IRecipe;
  isAdmin?: boolean;
}

const RecipeIngredients = ({ recipe, isAdmin }: Props) => {
  const { mutate } = useToggleIngredientStock();
  const handleStockToggle = ({
    ingredientId,
    isInStock,
  }: {
    ingredientId: number;
    isInStock: boolean;
  }) => {
    mutate({ ingredientId, isInStock });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Ingredients
      </h3>

      <div className="flex flex-col gap-2">
        {recipe.ingredients.map((ing) => (
          <div
            key={ing.ingredientId}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border px-3 py-2"
          >
            <Link
              href={frontendUrls.ingredients.view(ing.ingredientId)}
              className="font-medium truncate hover:underline"
            >
              {ing.ingredient.title}
            </Link>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {ing.amount}
            </span>
            {isAdmin ? (
              <StockToggleButton
                onToggle={() =>
                  handleStockToggle({
                    ingredientId: ing.ingredientId,
                    isInStock: ing.ingredient.isInStock,
                  })
                }
                isInStock={ing.ingredient.isInStock}
              />
            ) : (
              <StockBadge inInStock={ing.ingredient.isInStock} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeIngredients;
