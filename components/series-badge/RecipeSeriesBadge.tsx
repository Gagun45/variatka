import { IRecipeSeries, RECIPE_SERIES_LABELS } from "@/lib/constants";
import { Badge, badgeVariants } from "../ui/badge";
import { VariantProps } from "class-variance-authority";

interface Props {
  series: IRecipeSeries;
  className?: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const RecipeSeriesBadge = ({ series, className, variant }: Props) => {
  return (
    <Badge className={`${className}`} variant={variant ?? "outline"}>
      {RECIPE_SERIES_LABELS[series]}
    </Badge>
  );
};

export default RecipeSeriesBadge;
