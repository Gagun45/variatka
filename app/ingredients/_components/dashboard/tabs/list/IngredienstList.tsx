import { IIngredient } from "@/lib/prisma.args";
import IngredientCard from "./card/IngredientCard";
import { useAuthStore } from "@/zustand/auth.store";
import { useToggleSavedIngredient } from "@/features/ingredient/hooks/useToggleSavedIngredient";
import { useToggleIngredientStock } from "@/features/ingredient/hooks/useToggleIngredientStock";

interface Props {
  ingredients: IIngredient[];
}

const IngredienstList = ({ ingredients }: Props) => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { mutate: savedMutate } = useToggleSavedIngredient();
  const { mutate: stockMutate } = useToggleIngredientStock();
  return (
    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ingredients.map((ing) => (
        <IngredientCard
          onStockToggle={stockMutate}
          onSavedToggle={savedMutate}
          isAdmin={isAdmin}
          key={ing.id}
          ingredient={ing}
        />
      ))}
    </div>
  );
};

export default IngredienstList;
