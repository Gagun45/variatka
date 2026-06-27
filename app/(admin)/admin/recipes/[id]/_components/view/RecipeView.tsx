import { IRecipe } from "@/lib/prisma.args";

import { Card, CardContent } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import ViewItemEditLink from "@/components/view-item/ViewItemEditLink";
import { frontendUrls } from "@/lib/urls";
import RecipeHeader from "./header/RecipeHeader";
import RecipeImageViewAdmin from "./img/RecipeImageViewAdmin";
import RecipeIngredients from "./ings/RecipeIngredients";
import RecipeNotes from "./notes/RecipeNotes";

interface Props {
  recipe: IRecipe;
}

const RecipeView = ({ recipe }: Props) => {
  const { id } = recipe;
  return (
    <Card>
      <RecipeHeader recipe={recipe} />

      <CardContent className="view-item-card-content">
        <Separator />

        <RecipeImageViewAdmin recipe={recipe} />
        <ViewItemEditLink href={frontendUrls.recipes.edit(id)} />

        <RecipeIngredients recipe={recipe} />

        <Separator />

        <RecipeNotes recipe={recipe} />
      </CardContent>
    </Card>
  );
};

export default RecipeView;
