import { useToggleConfirmedRecipe } from "@/features/recipe/hooks/useToggleConfirmedRecipe";
import { useToggleSavedRecipe } from "@/features/recipe/hooks/useToggleSavedRecipe";
import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";

interface Props {
  recipes: IRecipe[];
}

const RecipesList = ({ recipes }: Props) => {
  const { mutate } = useToggleSavedRecipe();
  const { mutate: confirmMutate } = useToggleConfirmedRecipe();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((rec) => (
        <RecipeCard
          onSavedToggle={mutate}
          onConfirmToggle={confirmMutate}
          key={rec.id}
          recipe={rec}
        />
      ))}
    </div>
  );
};

export default RecipesList;
