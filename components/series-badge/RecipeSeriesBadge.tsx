import {
  IRecipeSeries,
  RECIPE_SERIES_DATA,
} from "@/lib/enumslist/series.constants";
import { Badge, badgeVariants } from "../ui/badge";
import { VariantProps } from "class-variance-authority";

interface Props {
  series: IRecipeSeries;
  className?: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const RecipeSeriesBadge = ({ series, className, variant }: Props) => {
  return (
    <Badge className={`${className}`} variant={variant ?? "default"}>
      {RECIPE_SERIES_DATA[series].label}
    </Badge>
  );
};

export default RecipeSeriesBadge;
