import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";

interface Props {
  recipes: IRecipe[];
}

const RecipesList = ({ recipes }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((rec) => (
        <RecipeCard key={rec.id} recipe={rec} />
      ))}
    </div>
  );
};

export default RecipesList;
