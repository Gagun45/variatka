import { useSimilarRecipes } from "@/hooks/useSimilarRecipes";
import { IRecipe } from "@/lib/prisma.args";
import RecipesList from "../../../_components/recipes/recipeTabs/recipes-list/RecipesList";

interface Props {
  recipe: IRecipe;
  allRecipes: IRecipe[];
}

const SimilarRecipes = ({ allRecipes, recipe }: Props) => {
  const similarRecipes = useSimilarRecipes(recipe, allRecipes);

  return (
    <div className="flex flex-col gap-3">
      <p>Similar recipes</p>
      <RecipesList recipes={similarRecipes} />
    </div>
  );
};

export default SimilarRecipes;
