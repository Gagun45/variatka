import { IRecipe } from "@/lib/prisma.args";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StockBadge from "@/components/stock-badge/StockBadge";
import { useToggleSavedRecipe } from "@/features/recipe/hooks/useToggleSavedRecipe";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";

interface Props {
  recipe: IRecipe;
  isAdmin: boolean;
}

const RecipeHeader = ({ recipe, isAdmin }: Props) => {
  const { mutate } = useToggleSavedRecipe();
  const { id, isSaved } = recipe;
  const onToggleSaved = () => {
    mutate({ isSaved, recipeId: id });
  };
  const { title, recipeCategory, description, inStock } = recipe;

  return (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <CardTitle className="text-2xl">{title}</CardTitle>

        <Badge variant="secondary">{recipeCategory.title}</Badge>
      </div>
      <div className="flex justify-between items-center gap-2">
        <StockBadge isInStock={!!inStock} quantity={inStock} />
        {isAdmin && (
          <SaveToggleButton isSaved={isSaved} onToggle={onToggleSaved} />
        )}
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
  );
};

export default RecipeHeader;
