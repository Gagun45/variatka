import { IRecipe } from "@/lib/prisma.args";

import { Card, CardContent } from "@/components/ui/card";

import ImageViewPublic from "@/components/img-upload/ImageViewPublic";
import { Separator } from "@/components/ui/separator";
import ViewItemEditLink from "@/components/view-item/ViewItemEditLink";
import { frontendUrls } from "@/lib/urls";
import { useAuthStore } from "@/zustand/auth.store";
import RecipeHeader from "./header/RecipeHeader";
import RecipeImageViewAdmin from "./img/RecipeImageViewAdmin";
import RecipeIngredients from "./ings/RecipeIngredients";
import RecipeNotes from "./notes/RecipeNotes";

interface Props {
  recipe: IRecipe;
}

const RecipeView = ({ recipe }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { imageKey, imageVersion, title, id } = recipe;
  return (
    <Card>
      <RecipeHeader recipe={recipe} isAdmin={isAdmin} />

      <CardContent className="view-item-card-content">
        <Separator />

        {isAdmin ? (
          <RecipeImageViewAdmin recipe={recipe} />
        ) : (
          <ImageViewPublic
            imageKey={imageKey}
            imageVersion={imageVersion}
            title={title}
          />
        )}

        <RecipeIngredients isAdmin={isAdmin} recipe={recipe} />

        <Separator />

        <RecipeNotes recipe={recipe} />

        {isAdmin && <ViewItemEditLink href={frontendUrls.recipes.edit(id)} />}
      </CardContent>
    </Card>
  );
};

export default RecipeView;
