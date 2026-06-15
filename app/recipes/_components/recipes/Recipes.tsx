import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";

interface Props {
  recipes: IRecipe[];
}

const Recipes = ({ recipes }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {recipes.map((rec) => (
        <RecipeCard key={rec.id} recipe={rec} />
      ))}
    </div>
  );
};

export default Recipes;
