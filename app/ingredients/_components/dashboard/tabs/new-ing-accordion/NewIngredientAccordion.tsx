import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import NewIngredientForm from "@/forms/add-ingredient/NewIngredientForm";
import { ICategory } from "@/lib/prisma.args";

interface Props {
  category: ICategory;
}

const NewIngredientAccordion = ({ category }: Props) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="new-ingredient" className="w-full mx-auto">
        <AccordionTrigger className={`${buttonVariants()}`}>
          New ingredient
        </AccordionTrigger>

        <AccordionContent className="h-auto pt-6">
          <NewIngredientForm category={category} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default NewIngredientAccordion;
