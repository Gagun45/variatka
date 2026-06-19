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
import { useCreateStuffCategory } from "@/features/stuff/hooks/useCreateStuffCategory";
import { useStuffCategories } from "@/features/stuff/hooks/useGetCategories";
import StuffCategoryForm from "@/forms/add-stuff-category/StuffCategoryForm";
import StuffForm from "@/forms/stuff/StuffForm";
import { ICreateStuffCategoryDto, ICreateStuffDto } from "@/zod/stuff.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  activeCategoryId?: number;
}

const StuffFormsDialog = ({ activeCategoryId }: Props) => {
  const { data: categories = [] } = useStuffCategories();
  const { mutate, isPending } = useCreateStuff();
  const { mutate: catMutate, isPending: catIsPending } =
    useCreateStuffCategory();
  const [isOpen, setIsOpen] = useState(false);
  const onCategoryCreate = (dto: ICreateStuffCategoryDto) => {
    catMutate(dto, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };
  const onStuffCreate = (dto: ICreateStuffDto) => {
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
            <StuffCategoryForm
              onSubmit={onCategoryCreate}
              isPending={catIsPending}
            />
          </TabsContent>

          {/* Ingredient form */}
          <TabsContent value="stuff" className="mt-4">
            <StuffForm
              initialCategoryId={activeCategoryId}
              categories={categories}
              isPending={isPending}
              onClick={onStuffCreate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StuffFormsDialog;
