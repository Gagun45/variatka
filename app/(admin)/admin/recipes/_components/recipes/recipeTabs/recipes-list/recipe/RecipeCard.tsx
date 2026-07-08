import ConfirmToggleButton from "@/components/confirmation-btn/ConfirmToggleButton";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { RECIPE_SERIES_DATA } from "@/lib/enumslist/series.constants";
import { getImageUrl } from "@/lib/image.helper";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import ReadyToCookTooltip from "./tooltip/ReadyToCookTooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StockBadge from "@/components/stock-badge/StockBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    series,
  } = recipe;
  const href = frontendUrls.recipes.view(id);

  const onToggle = () => {
    onSavedToggle(id);
  };

  const onToggleConfirm = () => {
    onConfirmToggle(id);
  };

  const imageSrc = getImageUrl(imageKey, imageVersion);
  const { icon, iconClassName, label } = RECIPE_SERIES_DATA[series];
  const Icon = icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition hover:shadow-md",
        isHidden &&
          "bg-muted/30 ring-muted-foreground/25 shadow-none hover:shadow-sm"
      )}
    >
      <CardHeader>
        <div className="flex justify-between gap-2 items-center">
          <SaveToggleButton isSaved={isSaved} onToggle={onToggle} />

          <ConfirmToggleButton
            isConfirmed={isConfirmed}
            onToggle={onToggleConfirm}
          />
          <ReadyToCookTooltip recipe={recipe} />
        </div>
      </CardHeader>

      <Link
        href={href}
        className="relative h-48 w-full overflow-hidden rounded-md transition hover:scale-[1.05]"
      >
        {isHidden && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 z-10 border border-border bg-background/90 text-muted-foreground shadow-sm"
          >
            Hidden
          </Badge>
        )}
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="384px"
          className={cn(
            "object-contain",
            isHidden && "grayscale opacity-55 saturate-50"
          )}
        />
      </Link>
      <div className="flex justify-center">
        <Link
          className={cn(
            "break-all hover:underline",
            isHidden && "text-muted-foreground"
          )}
          href={href}
        >
          {title}
        </Link>
      </div>
      <CardFooter className="justify-between items-center">
        {Icon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Icon size={24} className={`${iconClassName}`} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <StockBadge isInStock={!!inStock} quantity={inStock} />
      </CardFooter>

      {/* <RecipeSeriesBadge className="mx-auto" series={series} /> */}
    </Card>
  );
};

export default RecipeCard;
