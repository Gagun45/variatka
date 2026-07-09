import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateIngredient } from "@/features/ingredient/hooks/useCreateIngredient";
import NewIngredientForm from "@/forms/add-ingredient/IngredientForm";
import { IIngredientCategory } from "@/lib/enumslist/ingredient.constants";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  initialCategory: IIngredientCategory;
}

const IngredientFormsDialog = ({ initialCategory }: Props) => {
  const { mutate, isPending } = useCreateIngredient();

  const [isOpen, setIsOpen] = useState(false);

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
        <Button
          className="text-xl size-12"
          variant={"ghost"}
          aria-label="Create ingredient"
          title="Create ingredient"
        >
          <PlusCircle className="size-8" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Create new</DialogTitle>
        </DialogHeader>

        <NewIngredientForm
          initialCategory={initialCategory}
          isPending={isPending}
          onCreate={onCreateIngredient}
        />
      </DialogContent>
    </Dialog>
  );
};

export default IngredientFormsDialog;
