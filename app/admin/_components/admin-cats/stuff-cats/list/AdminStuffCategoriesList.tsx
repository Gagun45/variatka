import { useDeleteStuffCategory } from "@/features/stuff/hooks/useDeleteStuffCategory";
import { useEditStuffCategory } from "@/features/stuff/hooks/useEditStuffCategory";
import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import AdminCategoryCard from "../../../admin-cat-row/AdminCategoryCard";

interface Props {
  categories: IStuffCategory[];
  stuff: IStuff[];
}

const AdminStuffCategoriesList = ({ categories, stuff }: Props) => {
  const { mutate: deleteMutate, isPending: deletePending } =
    useDeleteStuffCategory();

  const { mutate: editMutate, isPending: editPending } = useEditStuffCategory();

  const sortedCategories = [...categories].sort((a, b) => {
    const aCount = stuff.filter((i) => i.stuffCategoryId === a.id).length;
    const bCount = stuff.filter((i) => i.stuffCategoryId === b.id).length;

    return bCount - aCount || a.title.localeCompare(b.title);
  });

  const isPending = deletePending || editPending;

  return (
    <div className="space-y-4 border p-2">
      <p className="text-center">Stuff categories</p>

      {sortedCategories.map((cat) => {
        const totalItems = stuff.filter(
          (i) => i.stuffCategoryId === cat.id,
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

export default AdminStuffCategoriesList;
