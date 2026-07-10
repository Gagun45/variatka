import WishedToggleButton from "@/app/(public)/_components/wish-btn/WishedToggleButton";
import SpicyLevelTooltip from "@/components/spicy-tooltip/SpicyLevelTooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RECIPE_CATEGORIES_DATA } from "@/lib/enumslist/recipe.constants";
import { RECIPE_SERIES_DATA } from "@/lib/enumslist/series.constants";
import { getImageUrl } from "@/lib/image.helper";
import { IPublicRecipe } from "@/lib/types";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import PublicRecipeCardCartButton from "./cart-btn/PublicRecipeCardCartButton";

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
  const { id, imageKey, title, description, category, series, spicy } = recipe;

  const isWished = wishlistIdsSet.has(id);
  const imageSrc = getImageUrl(imageKey);
  const { icon, iconClassName, label } = RECIPE_SERIES_DATA[series];
  const Icon = icon;
  const {
    icon: categoryIcon,
    label: categoryLabel,
    iconClassName: categoryIconClassName,
  } = RECIPE_CATEGORIES_DATA[category];
  const CategoryIcon = categoryIcon;

  return (
    <Card className="h-full overflow-hidden py-0 transition-colors hover:ring-foreground/20">
      <div className="relative border-b bg-muted/30">
        <Link href={frontendUrls.public.view(id)} className="block">
          <div className="relative aspect-4/3 w-full">
            <Image
              src={imageSrc}
              alt={title}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover/card:scale-[1.02]"
            />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {CategoryIcon && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex size-8 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur">
                  <CategoryIcon
                    size={17}
                    className={`${categoryIconClassName}`}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{categoryLabel}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {Icon && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex size-8 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur">
                  <Icon size={17} className={`${iconClassName}`} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex min-h-8 items-center">
          <SpicyLevelTooltip level={spicy} />
        </div>

        {isAuthenticated && (
          <WishedToggleButton
            className="absolute right-3 top-3 border bg-background/90 shadow-sm backdrop-blur"
            onToggle={onToggleWished}
            isWished={isWished}
          />
        )}
      </div>

      <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-base font-semibold leading-snug">
            <Link
              href={frontendUrls.public.view(id)}
              className="line-clamp-2 hover:underline"
            >
              {title}
            </Link>
          </h2>

          {description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <PublicRecipeCardCartButton recipe={recipe} />
      </CardContent>
    </Card>
  );
};

export default PublicRecipeCard;
