import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateStuff } from "@/features/stuff/hooks/useCreateStuff";
import StuffForm from "@/forms/stuff/StuffForm";
import { IStuffCategory } from "@/lib/enumslist/stuff.constants";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  activeCategory: IStuffCategory;
}

const StuffFormsDialog = ({ activeCategory }: Props) => {
  const { mutate, isPending } = useCreateStuff();

  const [isOpen, setIsOpen] = useState(false);

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
          <DialogTitle className="text-center text-xl">Add stuff</DialogTitle>
        </DialogHeader>

        <StuffForm
          initialCategory={activeCategory}
          isPending={isPending}
          onClick={onStuffCreate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StuffFormsDialog;
