import { Card } from "@/components/ui/card";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";

type Props = {
  recipe: IRecipe;
};

const RecipeCard = ({ recipe }: Props) => {
  const { id, title, imageKey } = recipe;

  return (
    <Link href={frontendUrls.recipes.view(id)}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition">
        <div className="relative h-40 w-full bg-muted">
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
