import { IRecipe } from "@/lib/prisma.args";
import RecipeCard from "./recipe/RecipeCard";
import { useAuthStore } from "@/zustand/auth.store";
import { useToggleSavedRecipe } from "@/features/recipe/hooks/useToggleSavedRecipe";
import { useToggleConfirmedRecipe } from "@/features/recipe/hooks/useToggleConfirmedRecipe";

interface Props {
  recipes: IRecipe[];
}

const RecipesList = ({ recipes }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { mutate } = useToggleSavedRecipe();
  const { mutate: confirmMutate } = useToggleConfirmedRecipe();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((rec) => (
        <RecipeCard
          onSavedToggle={mutate}
          onConfirmToggle={confirmMutate}
          isAdmin={isAdmin}
          key={rec.id}
          recipe={rec}
        />
      ))}
    </div>
  );
};

export default RecipesList;
