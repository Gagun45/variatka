import { IRecipe } from "@/lib/prisma.args";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StockBadge from "@/components/stock-badge/StockBadge";

interface Props {
  recipe: IRecipe;
}

const RecipeHeader = ({ recipe }: Props) => {
  const { title, recipeCategory, description, inStock } = recipe;

  return (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <CardTitle className="text-2xl">{title}</CardTitle>

        <Badge variant="secondary">{recipeCategory.title}</Badge>
      </div>
      <StockBadge inInStock={!!inStock} quantity={inStock} />

      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
  );
};

export default RecipeHeader;
