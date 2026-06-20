import { useDeleteRecipeCategory } from "@/features/recipe/hooks/useDeleteRecipeCategory";
import { useEditRecipeCategory } from "@/features/recipe/hooks/useEditRecipeCategory";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import AdminCategoryCard from "../../../admin-cat-row/AdminCategoryCard";

interface Props {
  categories: IRecipeCategory[];
  recipes: IRecipe[];
}

const AdminRecipeCategoriesList = ({ categories, recipes }: Props) => {
  const { mutate: deleteMutate, isPending: deletePending } =
    useDeleteRecipeCategory();

  const { mutate: editMutate, isPending: editPending } =
    useEditRecipeCategory();

  const sortedCategories = categories.sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  const isPending = deletePending || editPending;

  return (
    <div className="space-y-4 border p-2">
      <p className="text-center">Recipe categories</p>

      {sortedCategories.map((cat) => {
        const totalItems = recipes.filter(
          (i) => i.recipeCategoryId === cat.id,
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

export default AdminRecipeCategoriesList;
