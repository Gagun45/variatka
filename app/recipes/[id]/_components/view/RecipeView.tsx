import { IRecipe } from "@/lib/prisma.args";

import { Card, CardContent } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import RecipeActions from "./actions/RecipeActions";
import RecipeHeader from "./header/RecipeHeader";
import RecipeIngredients from "./ings/RecipeIngredients";
import RecipeNotes from "./notes/RecipeNotes";

interface Props {
  recipe: IRecipe;
}

const RecipeView = ({ recipe }: Props) => {
  return (
    <Card className="mx-auto">
      <RecipeHeader recipe={recipe} />

      <CardContent className="flex flex-col gap-5">
        <Separator />

        <RecipeIngredients recipe={recipe} />

        <Separator />

        <RecipeNotes notes={recipe.notes} />

        <Separator />

        <RecipeActions id={recipe.id} />
      </CardContent>
    </Card>
  );
};

export default RecipeView;
