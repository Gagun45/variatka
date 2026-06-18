import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateStuff } from "@/features/stuff/hooks/useCreateStuff";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import NewStuffCategoryForm from "@/forms/add-stuff-category/NewStuffCategoryForm";
import NewStuffForm from "@/forms/stuff/NewStuffForm";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const StuffFormsDialog = () => {
  const { data: categories = [] } = useStuffCategories();
  const { mutate, isPending } = useCreateStuff();
  const [isOpen, setIsOpen] = useState(false);
  const onNewStuffCreate = (dto: ICreateStuffDto) => {
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
          <DialogTitle className="text-center text-xl">Create new</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stuff" className="w-full">
          {/* Tabs header */}
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="stuff">Stuff</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
          </TabsList>

          {/* Category form */}
          <TabsContent value="category" className="mt-4">
            <NewStuffCategoryForm />
          </TabsContent>

          {/* Ingredient form */}
          <TabsContent value="stuff" className="mt-4">
            <NewStuffForm
              categories={categories}
              isPending={isPending}
              onClick={onNewStuffCreate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StuffFormsDialog;
