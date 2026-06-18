import StockBadge from "@/components/stock-badge/StockBadge";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeIngredients = ({ recipe }: Props) => {
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
            <span className="font-medium truncate">{ing.ingredient.title}</span>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {ing.amount}
            </span>
            <StockBadge className="w-24" inInStock={ing.ingredient.isInStock} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeIngredients;
