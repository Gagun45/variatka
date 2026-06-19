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
      <div className="flex flex-col gap-2 px-2">
        {isAdmin && (
          <div className="flex justify-between gap-2 items-center">
            {onSavedToggle && (
              <SaveToggleButton isSaved={isSaved} onToggle={onToggle} />
            )}
            <Badge variant={isReadyToMake ? "default" : "outline"}>
              {inStockIngredients}/{totalIngredients}
            </Badge>
          </div>
        )}
        <Link
          href={href}
          className="relative hover:scale-[1.05] transition h-48 w-full rounded-md overflow-hidden"
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="384px"
            className="object-contain"
          />
        </Link>
      </div>
      <div className="flex justify-center mx-2">
        <Link className="hover:underline break-all" href={href}>
          {title}
        </Link>
      </div>
    </Card>
  );
};

export default RecipeCard;
