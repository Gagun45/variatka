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
import { useCreateIngredientCategory } from "@/features/ingredient/hooks/useCreateIngredientCategory";
import NewCategoryForm from "@/forms/add-ing-category/NewIngredientCategoryForm";
import NewIngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientCategory } from "@/lib/prisma.args";
import {
  ICreateIngredientCategoryDto,
  IIngredientFormValues,
} from "@/zod/ingredient.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  categories: IIngredientCategory[];
}

const IngredientFormsDialog = ({ categories }: Props) => {
  const { mutate, isPending } = useCreateIngredient();

  const { mutate: catMutate, isPending: catIsPending } =
    useCreateIngredientCategory();

  const [isOpen, setIsOpen] = useState(false);
  const onCategoryCreate = (dto: ICreateIngredientCategoryDto) => {
    catMutate(dto, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };
  const onCreateIngredient = (dto: IIngredientFormValues) => {
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

        <Tabs defaultValue="ingredient" className="w-full">
          {/* Tabs header */}
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="ingredient">Ingredient</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
          </TabsList>

          {/* Category form */}
          <TabsContent value="category" className="mt-4">
            <NewCategoryForm
              onCreate={onCategoryCreate}
              isPending={catIsPending}
            />
          </TabsContent>

          {/* Ingredient form */}
          <TabsContent value="ingredient" className="mt-4">
            <NewIngredientForm
              isPending={isPending}
              onCreate={onCreateIngredient}
              categories={categories}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientFormsDialog;
