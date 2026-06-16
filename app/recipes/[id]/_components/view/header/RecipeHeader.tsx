import { IRecipe } from "@/lib/prisma.args";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  recipe: IRecipe;
}

const RecipeHeader = ({ recipe }: Props) => {
  const { title, recipeCategory, description } = recipe;

  return (
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <CardTitle className="text-2xl">{title}</CardTitle>

        <Badge variant="secondary">{recipeCategory.title}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
  );
};

export default RecipeHeader;
