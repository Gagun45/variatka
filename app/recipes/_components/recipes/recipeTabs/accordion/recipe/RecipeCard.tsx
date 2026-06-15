import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IRecipe } from "@/lib/prisma.args";

type Props = {
  recipe: IRecipe;
};

const RecipeCard = ({ recipe }: Props) => {
  return (
    <AccordionItem
      value={recipe.id.toString()}
      className="border rounded-md px-4 bg-card py-2"
    >
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold">{recipe.title}</span>

          <span className="text-xs text-muted-foreground">
            {recipe.description}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-3">
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((item) => (
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
        {recipe.notes && (
          <p className="text-xs text-muted-foreground italic">{recipe.notes}</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default RecipeCard;
