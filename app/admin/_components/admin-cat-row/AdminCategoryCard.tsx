import DeleteDialog from "@/components/delete-dialog/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  onSubmit: (title: string) => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
  isPending: boolean;
  totalItems: number;
}

const AdminCategoryCard = ({
  title,
  onSubmit,
  onDelete,
  isDeleteDisabled,
  isPending,
  totalItems,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const handleCancel = () => {
    setValue(title);
    setIsEditing(false);
  };
  const handleSubmit = () => {
    if (!value) {
      setValue(title);
      setIsEditing(false);
      return;
    }
    if (value === title) {
      setIsEditing(false);
      return;
    }
    onSubmit(value);
    setIsEditing(false);
  };
  const handleDelete = () => {
    onDelete();
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex-1">
          {isEditing ? (
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          ) : (
            <div className="flex flex-col">
              <p className="font-medium">{title}</p>

              <p className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          )}
        </div>

        {isEditing ? (
          <>
            <Button size="icon" onClick={handleSubmit}>
              <Check />
            </Button>

            <Button size="icon" variant="outline" onClick={handleCancel}>
              <X />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </Button>
        )}

        <DeleteDialog
          onDelete={handleDelete}
          isPending={isPending}
          alertTitle={`Delete category ${title}?`}
          isDisabled={isDeleteDisabled}
          alertDescription="This action cannot be undone. If there are items related to the category, action will be blocked."
        />
      </CardContent>
    </Card>
  );
};

export default AdminCategoryCard;
