import ConfirmToggleButton from "@/components/confirmation-btn/ConfirmToggleButton";
import SaveToggleButton from "@/components/save-button/SaveToggleButton";
import RecipeSeriesBadge from "@/components/series-badge/RecipeSeriesBadge";
import { Card } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image.helper";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import ReadyToCookTooltip from "./tooltip/ReadyToCookTooltip";

type Props = {
  recipe: IRecipe;
  onSavedToggle: (recipeId: number) => void;
  onConfirmToggle: (recipeId: number) => void;
};

const RecipeCard = ({ recipe, onSavedToggle, onConfirmToggle }: Props) => {
  const { id, title, imageKey, isSaved, isConfirmed, imageVersion, series } =
    recipe;
  const href = frontendUrls.recipes.view(id);

  const onToggle = () => {
    onSavedToggle(id);
  };

  const onToggleConfirm = () => {
    onConfirmToggle(id);
  };

  const imageSrc = getImageUrl(imageKey, imageVersion);

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col gap-2 px-2">
        <div className="flex justify-between gap-2 items-center">
          <SaveToggleButton isSaved={isSaved} onToggle={onToggle} />

          <ConfirmToggleButton
            isConfirmed={isConfirmed}
            onToggle={onToggleConfirm}
          />
          <ReadyToCookTooltip recipe={recipe} />
        </div>

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
      </div>
      <div className="flex justify-center mx-2">
        <Link className="hover:underline break-all" href={href}>
          {title}
        </Link>
      </div>

      <RecipeSeriesBadge className="mx-auto" series={series} />
    </Card>
  );
};

export default RecipeCard;
