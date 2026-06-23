import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

interface Props {
  recipe: IRecipe;
  isAdmin?: boolean;
}

const RecipeIngredients = ({ recipe, isAdmin }: Props) => {
  const { mutate } = useToggleIngredientStock();
  const { mutate: savedMutate } = useToggleSavedIngredient();
  const handleStockToggle = ({
    ingredientId,
    isInStock,
  }: {
    ingredientId: number;
    isInStock: boolean;
  }) => {
    mutate({ ingredientId, isInStock });
  };

  const handleSavedToggle = ({
    ingredientId,
    isSaved,
  }: {
    ingredientId: number;
    isSaved: boolean;
  }) => {
    savedMutate({ ingredientId, isSaved });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold">Ingredients</h3>

      <div className="flex flex-col gap-2">
        {recipe.ingredients.map((ing) => {
          const {
            ingredientId: id,
            ingredient: { isInStock, isSaved, title },
            amount,
          } = ing;
          const onToggle = () =>
            handleStockToggle({
              ingredientId: id,
              isInStock,
            });
          const onToggleSaved = () =>
            handleSavedToggle({
              ingredientId: id,
              isSaved,
            });
          return (
            <div
              key={id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <Link
                href={frontendUrls.ingredients.view(id)}
                className="min-w-0 font-medium truncate hover:underline"
              >
                {title}
              </Link>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {amount}
                </span>

                <StockBadge
                  isInStock={isInStock}
                  onClick={isAdmin ? onToggle : undefined}
                />

                <SaveToggleButton isSaved={isSaved} onToggle={onToggleSaved} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeIngredients;
