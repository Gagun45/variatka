import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import NewCategoryForm from "@/forms/add-category/NewCategoryForm";

const NewCategoryDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-xl size-12" variant={"ghost"}>
          <PlusCircle className="size-8" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new category</DialogTitle>
        </DialogHeader>

        <NewCategoryForm />
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryDialog;
