import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.helper";
import { IPublicRecipe } from "@/lib/types";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";

interface Props {
  recipe: IPublicRecipe;
  wishlistIdsSet: Set<number>;
  onToggleWished: () => void;
  isAuthenticated: boolean;
}

const PublicRecipeCard = ({
  recipe,
  wishlistIdsSet,
  onToggleWished,
  isAuthenticated,
}: Props) => {
  const isWished = wishlistIdsSet.has(recipe.id);
  const imageSrc = getImageUrl(recipe.imageKey);
  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <Link href={frontendUrls.public.view(recipe.id)}>
        <div className="relative aspect-square w-full bg-muted">
          <Image
            src={imageSrc}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-3 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <Link
            href={frontendUrls.public.view(recipe.id)}
            className="text-sm font-medium line-clamp-1 hover:underline"
          >
            {recipe.title}
          </Link>

          {recipe.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {isAuthenticated && (
          <WishedToggleButton onToggle={onToggleWished} isWished={isWished} />
        )}
      </CardContent>
    </Card>
  );
};

export default PublicRecipeCard;
