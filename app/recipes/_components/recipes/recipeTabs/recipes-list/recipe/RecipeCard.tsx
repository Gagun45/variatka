import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.helper";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";

type Props = {
  recipe: IRecipe;
  isAdmin?: boolean;
  onSavedToggle?: (value: { recipeId: number; isSaved: boolean }) => void;
};

const RecipeCard = ({ recipe, isAdmin, onSavedToggle }: Props) => {
  const { id, title, imageKey, ingredients, isSaved, imageVersion } = recipe;
  const href = frontendUrls.recipes.view(id);
  const totalIngredients = ingredients.length;
  const inStockIngredients = ingredients.filter(
    (i) => i.ingredient.isInStock,
  ).length;

  const isReadyToMake = inStockIngredients === totalIngredients;
  const onToggle = () => {
    if (onSavedToggle) {
      onSavedToggle({ recipeId: id, isSaved });
    } else return;
  };

  const imageSrc = getImageUrl(imageKey, imageVersion);

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <Link href={href} className="flex flex-col gap-2 px-2">
        {isAdmin && (
          <div className="flex justify-end">
            <Badge variant={isReadyToMake ? "default" : "outline"}>
              {inStockIngredients}/{totalIngredients}
            </Badge>
          </div>
        )}
        <div className="relative h-48 w-full rounded-md overflow-hidden">
          {/* status badge */}

          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="384px"
            className="object-contain"
          />
        </div>
      </Link>

      <div className="flex justify-between px-2 items-start">
        <Link className="hover:underline" href={href}>
          {title}
        </Link>
        {isAdmin && onSavedToggle && (
          <SaveToggleButton isSaved={isSaved} onToggle={onToggle} />
        )}
      </div>
    </Card>
  );
};

export default RecipeCard;
