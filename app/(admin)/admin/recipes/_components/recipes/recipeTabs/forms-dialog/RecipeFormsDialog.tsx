import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateRecipeCategory } from "@/features/recipe/hooks/useCreateRecipeCategory";
import NewRecipeCategoryForm from "@/forms/add-recipe-category/NewRecipeCategoryForm";
import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const RecipeFormsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = useCreateRecipeCategory();
  const onCategoryCreate = (dto: ICreateRecipeCategoryDto) => {
    mutate(dto, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xl size-12" variant={"ghost"}>
          <PlusCircle className="size-8" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            New recipe category
          </DialogTitle>
        </DialogHeader>
        <NewRecipeCategoryForm
          onCreate={onCategoryCreate}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RecipeFormsDialog;
