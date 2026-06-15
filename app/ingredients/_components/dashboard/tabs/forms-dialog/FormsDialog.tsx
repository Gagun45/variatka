import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateIngredient } from "@/features/ingredient/hooks/useCreateIngredient";
import NewCategoryForm from "@/forms/add-ing-category/NewIngredientCategoryForm";
import NewIngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientCategory } from "@/lib/prisma.args";
import { PlusCircle } from "lucide-react";
import React from "react";

interface Props {
  categories: IIngredientCategory[];
}

const FormsDialog = ({ categories }: Props) => {
  const { mutate, isPending } = useCreateIngredient();
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

        <Tabs defaultValue="ingredient" className="w-full">
          {/* Tabs header */}
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="ingredient">Ingredient</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
          </TabsList>

          {/* Category form */}
          <TabsContent value="category" className="mt-4">
            <NewCategoryForm />
          </TabsContent>

          {/* Ingredient form */}
          <TabsContent value="ingredient" className="mt-4">
            <NewIngredientForm
              isPending={isPending}
              onClick={mutate}
              categories={categories}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FormsDialog;
