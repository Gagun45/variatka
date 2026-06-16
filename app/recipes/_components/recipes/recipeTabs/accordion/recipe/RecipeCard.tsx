import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IRecipe } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";

type Props = {
  recipe: IRecipe;
};

const RecipeCard = ({ recipe }: Props) => {
  const { id, description, title, notes, ingredients } = recipe;
  return (
    <AccordionItem
      value={id.toString()}
      className="border rounded-md px-4 bg-card py-2"
    >
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold">{title}</span>

          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-3">
        <div className="flex flex-col gap-2">
          {ingredients.map((item) => (
            <div
              key={item.ingredient.id}
              className="flex items-center bg-muted justify-between rounded-md border px-3 py-2"
            >
              <span className="text-sm font-medium">
                {item.ingredient.title}
              </span>

              <span className="text-sm font-semibold text-muted-foreground">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
        {notes && (
          <p className="text-xs text-muted-foreground italic">{notes}</p>
        )}
        <Link href={frontendUrls.recipes.view(id)}>Go to</Link>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RecipeCard;
