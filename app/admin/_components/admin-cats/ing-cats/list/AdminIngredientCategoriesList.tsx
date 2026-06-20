import { useDeleteIngredientCategory } from "@/features/ingredient/hooks/useDeleteIngredientCategory";
import { useEditIngredientCategory } from "@/features/ingredient/hooks/useEditIngredientCategory";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import AdminCategoryCard from "../../../admin-cat-row/AdminCategoryCard";

interface Props {
  categories: IIngredientCategory[];
  ingredients: IIngredient[];
}

const AdminIngredientCategoriesList = ({ categories, ingredients }: Props) => {
  const { mutate: deleteMutate, isPending: deletePending } =
    useDeleteIngredientCategory();

  const { mutate: editMutate, isPending: editPending } =
    useEditIngredientCategory();

  const isPending = deletePending || editPending;

  return (
    <div className="space-y-4 border p-2">
      <p className="text-center">Ingredient categories</p>

      {categories.map((cat) => {
        const totalItems = ingredients.filter(
          (i) => i.categoryId === cat.id,
        ).length;

        return (
          <AdminCategoryCard
            key={cat.id}
            totalItems={totalItems}
            title={cat.title}
            isDeleteDisabled={totalItems > 0}
            isPending={isPending}
            onDelete={() => deleteMutate(cat.id)}
            onSubmit={(title) => editMutate({ id: cat.id, dto: { title } })}
          />
        );
      })}
    </div>
  );
};

export default AdminIngredientCategoriesList;
