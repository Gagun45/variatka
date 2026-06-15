import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewRecipeCategoryForm from "@/forms/add-recipe-category/NewRecipeCategoryForm";
import { PlusCircle } from "lucide-react";

const NewRecipeDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-xl size-12" variant={"ghost"}>
          <PlusCircle className="size-8" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Create new</DialogTitle>
        </DialogHeader>
        <NewRecipeCategoryForm />
      </DialogContent>
    </Dialog>
  );
};

export default NewRecipeDialog;
