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
      className={`overflow-hidden hover:shadow-md transition relative ${isHidden ? "select-none" : ""}`}
    >
      {/* 3. Optional: Absolute overlay banner for extra visual clarity */}
      {isHidden && (
        <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <span className="bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm">
            Hidden
          </span>
        </div>
      )}
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
      <div className="flex justify-center">
        <Link className="hover:underline break-all" href={href}>
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
