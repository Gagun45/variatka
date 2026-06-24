import { IPublicRecipe } from "@/lib/types";
import PublicRecipeCard from "./card/PublicRecipeCard";

interface Props {
  recipes: IPublicRecipe[];
}

const PublicRecipesList = ({ recipes }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {recipes.map((r) => (
        <PublicRecipeCard recipe={r} key={r.id} />
      ))}
    </div>
  );
};

export default PublicRecipesList;
