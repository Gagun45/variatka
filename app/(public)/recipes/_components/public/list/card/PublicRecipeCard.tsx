import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
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
  const { id, imageKey, title, isInStock, description } = recipe;
  const isWished = wishlistIdsSet.has(id);
  const imageSrc = getImageUrl(imageKey);
  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <Link href={frontendUrls.public.view(id)}>
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt={title}
            sizes="384px"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      {/* Content */}
      <CardContent className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-2 min-w-0">
          <StockBadge isInStock={isInStock} />
          <Link
            href={frontendUrls.public.view(id)}
            className="text-sm font-medium line-clamp-1 hover:underline"
          >
            {title}
          </Link>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
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
