import RecipesAccordion from "@/app/recipes/_components/recipes/recipeTabs/accordion/RecipesAccordion";
import { useSimilarRecipes } from "@/hooks/useSimilarRecipes";
import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
  allRecipes: IRecipe[];
}

const SimilarRecipes = ({ allRecipes, recipe }: Props) => {
  const similarRecipes = useSimilarRecipes(recipe, allRecipes);

  return (
    <div className="flex flex-col gap-3">
      <p>Similar recipes</p>
      <RecipesAccordion recipes={similarRecipes} />
    </div>
  );
};

export default SimilarRecipes;
