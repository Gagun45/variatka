import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Button } from "@/components/ui/button";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  recipe: IRecipe;
}

const RecipeIngredients = ({ recipe }: Props) => {
  const { mutate } = useToggleIngredientStock();
  const { mutate: savedMutate } = useToggleSavedIngredient();
  const handleCopyIngredients = async () => {
    const text = recipe.ingredients
      .map(({ ingredient: { title }, amount }) => `${title} - ${amount}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Ingredients</h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyIngredients}
          aria-label="Copy ingredients"
        >
          <Copy className="size-4" />
        </Button>
      </div>

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

                <StockBadge isInStock={isInStock} onClick={onToggle} />

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
