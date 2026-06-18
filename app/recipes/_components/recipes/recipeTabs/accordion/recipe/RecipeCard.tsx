import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  const { id, title, imageKey, ingredients, isSaved } = recipe;
  const href = frontendUrls.recipes.view(id);
  const isReadyToMake = ingredients.some((i) => !i.ingredient.isInStock);
  const onToggle = () => {
    if (onSavedToggle) {
      onSavedToggle({ recipeId: id, isSaved });
    } else return;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <Link href={href} className="flex flex-col gap-2 ">
        <div className="relative h-40 w-full bg-muted">
          {/* status badge */}

          {isAdmin && (
            <Badge
              variant={isReadyToMake ? "default" : "outline"}
              className="absolute right-2 top-2 z-10"
            >
              {isReadyToMake ? "Ready to cook" : "Missing ingredients"}
            </Badge>
          )}

          {imageKey ? (
            <Image src={imageKey} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
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
