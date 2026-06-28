import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import RecipeSeriesBadge from "@/components/series-badge/RecipeSeriesBadge";
import SpicyLevel from "@/components/spicy/SpicyLevel";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RECIPE_SERIES_DATA } from "@/lib/enumslist/series.constants";
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
  const { id, imageKey, title, isInStock, description, series, spicy } = recipe;
  const isWished = wishlistIdsSet.has(id);
  const imageSrc = getImageUrl(imageKey);
  const { icon, iconClassName, label } = RECIPE_SERIES_DATA[series];
  const Icon = icon;

  return (
    <Card className="overflow-hidden">
      {/* Image */}

      {Icon && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon
              size={24}
              className={`${iconClassName} mx-auto cursor-help`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      )}

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
        <div className="flex flex-col gap-2 min-w-0 w-full">
          <div className="flex w-full items-center justify-between">
            <StockBadge isInStock={isInStock} />
            <SpicyLevel level={spicy} />
            {isAuthenticated && (
              <WishedToggleButton
                onToggle={onToggleWished}
                isWished={isWished}
              />
            )}
          </div>

          <Link
            href={frontendUrls.public.view(id)}
            className="text-sm font-medium text-center line-clamp-1 hover:underline"
          >
            {title}
          </Link>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicRecipeCard;
