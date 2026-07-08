import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import RecipeSeriesBadge from "@/components/series-badge/RecipeSeriesBadge";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import ViewItemCategory from "@/components/view-item/ViewItemCategory";
import ViewItemDescription from "@/components/view-item/ViewItemDescription";
import { useToggleSavedRecipe } from "@/features/recipe/hooks/useToggleSavedRecipe";
import { SpicyOptions } from "@/forms/recipe/fields/SpicyField";
import { RECIPE_CATEGORIES_DATA } from "@/lib/enumslist/recipe.constants";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeHeader = ({ recipe }: Props) => {
  const { mutate } = useToggleSavedRecipe();
  const { id, isSaved } = recipe;
  const onToggleSaved = () => {
    mutate(id);
  };
  const { description, inStock, spicy, series, isHidden, category } = recipe;
  const categoryLabel = RECIPE_CATEGORIES_DATA[category].label;

  return (
    <CardHeader className="view-item-card-header">
      <div className="view-item-card-header-row">
        <ViewItemCategory categoryTitle={categoryLabel} />
        <StockBadge isInStock={!!inStock} quantity={inStock} />
      </div>
      <div className="view-item-card-header-row">
        <ViewItemDescription description={description} />

        <SaveToggleButton isSaved={isSaved} onToggle={onToggleSaved} />
      </div>

      <div className="view-item-card-header-row">
        <RecipeSeriesBadge series={series} />
        <Badge>
          Spicy: {SpicyOptions.find((o) => o.value === spicy)?.label}
        </Badge>
      </div>
      <div className="view-item-card-header-row">
        <Badge>Hidden: {isHidden ? "Yes" : "No"}</Badge>
      </div>
    </CardHeader>
  );
};

export default RecipeHeader;
