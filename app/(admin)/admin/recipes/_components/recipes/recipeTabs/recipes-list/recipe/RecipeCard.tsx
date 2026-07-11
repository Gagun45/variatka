import ConfirmToggleButton from "@/components/confirmation-btn/ConfirmToggleButton";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RECIPE_CATEGORIES_DATA } from "@/lib/enumslist/recipe.constants";
import { RECIPE_SERIES_DATA } from "@/lib/enumslist/series.constants";
import { getImageUrl } from "@/lib/image.helper";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import ReadyToCookTooltip from "./tooltip/ReadyToCookTooltip";

type Props = {
  recipe: IRecipe;
  onSavedToggle: (recipeId: number) => void;
  onConfirmToggle: (recipeId: number) => void;
};

const RecipeCard = ({ recipe, onSavedToggle, onConfirmToggle }: Props) => {
  const {
    id,
    title,
    imageKey,
    isSaved,
    inStock,
    isConfirmed,
    imageVersion,
    isHidden,
    category,
    series,
  } = recipe;

  const href = frontendUrls.recipes.edit(id);
  const imageSrc = getImageUrl(imageKey, imageVersion);
  const categoryData = RECIPE_CATEGORIES_DATA[category];
  const seriesData = RECIPE_SERIES_DATA[series];

  return (
    <Card
      size="sm"
      className={cn(
        "relative grid grid-cols-[5.75rem_1fr] gap-0 py-0 transition-colors hover:ring-foreground/20 sm:grid-cols-[7rem_1fr]",
        isHidden && "bg-muted/30 text-muted-foreground hover:ring-border",
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Edit ${title}`}
      />

      <div className="relative min-h-32 overflow-hidden border-r bg-muted/30 sm:min-h-36">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="128px"
          className={cn(
            "object-contain p-2",
            isHidden && "grayscale opacity-50 saturate-50",
          )}
        />
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-3 p-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div
              className={cn(
                "min-w-0 break-words text-sm font-semibold leading-snug",
                isHidden && "text-muted-foreground",
              )}
            >
              {title}
            </div>

            <div className="relative z-20 flex shrink-0 items-center gap-1">
              <SaveToggleButton
                className="size-7"
                isSaved={isSaved}
                onToggle={() => onSavedToggle(id)}
              />
              <ConfirmToggleButton
                className="size-7"
                isConfirmed={isConfirmed}
                onToggle={() => onConfirmToggle(id)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isHidden && (
              <Badge variant="secondary" className="gap-1 border">
                <EyeOff className="size-3" />
                Hidden
              </Badge>
            )}

            <div className="relative z-20 flex gap-1.5">
              <IconBadge
                icon={categoryData.icon}
                iconClassName={categoryData.iconClassName}
                label={categoryData.label}
              />
              <IconBadge
                icon={seriesData.icon}
                iconClassName={seriesData.iconClassName}
                label={seriesData.label}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
          <ReadyToCookTooltip recipe={recipe} />

          <StockBadge isInStock={!!inStock} quantity={inStock} />
        </div>
      </div>
    </Card>
  );
};

function IconBadge({
  icon: Icon,
  iconClassName,
  label,
}: {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  iconClassName?: string;
  label: string;
}) {
  if (!Icon) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="h-7 w-7 rounded-full px-0"
          aria-label={label}
        >
          <Icon className={cn("size-3.5", iconClassName)} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default RecipeCard;
