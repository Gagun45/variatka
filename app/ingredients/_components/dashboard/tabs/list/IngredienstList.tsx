import { IIngredient } from "@/lib/prisma.args";
import IngredientCard from "./card/IngredientCard";
import { useAuthStore } from "@/zustand/auth.store";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleMyIngredient";

interface Props {
  ingredients: IIngredient[];
}

const IngredienstList = ({ ingredients }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { mutate } = useToggleSavedIngredient();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ingredients.map((ing) => (
        <IngredientCard
          onSavedToggle={mutate}
          isAdmin={isAdmin}
          key={ing.id}
          ingredient={ing}
        />
      ))}
    </div>
  );
};

export default IngredienstList;
