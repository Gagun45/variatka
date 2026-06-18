import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";

type Props = {
  recipe: IRecipe;
};

const RecipeCard = ({ recipe }: Props) => {
  const { id, title, imageKey, ingredients } = recipe;
  const isReadyToMake = ingredients.some((i) => !i.ingredient.isInStock);

  return (
    <Link href={frontendUrls.recipes.view(id)}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition">
        <div className="relative h-40 w-full bg-muted">
          {/* status badge */}

          <Badge
            variant={isReadyToMake ? "default" : "outline"}
            className="absolute right-2 top-2 z-10"
          >
            {isReadyToMake ? "Ready to cook" : "Missing ingredients"}
          </Badge>

          {imageKey ? (
            <Image src={imageKey} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-1">{title}</h3>
        </div>
      </Card>
    </Link>
  );
};

export default RecipeCard;
