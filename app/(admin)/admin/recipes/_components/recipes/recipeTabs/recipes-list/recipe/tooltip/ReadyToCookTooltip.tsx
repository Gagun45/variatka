import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IRecipe } from "@/lib/prisma.args";
interface Props {
  recipe: IRecipe;
}

const ReadyToCookTooltip = ({ recipe }: Props) => {
  const { ingredients } = recipe;
  const totalIngredients = ingredients.length;

  const missingIngredients = ingredients.filter((i) => !i.ingredient.isInStock);

  const inStockIngredients = totalIngredients - missingIngredients.length;

  const isReadyToMake = missingIngredients.length === 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={isReadyToMake ? "default" : "outline"}>
          {inStockIngredients}/{totalIngredients}
        </Badge>
      </TooltipTrigger>

      <TooltipContent>
        {isReadyToMake ? (
          <p>Ready to cook</p>
        ) : (
          <div className="space-y-1">
            <p className="font-medium">
              Missing ingredients ({missingIngredients.length}):
            </p>

            <ul>
              {missingIngredients.map((item) => (
                <li
                  key={item.ingredient.id}
                  className="flex items-center gap-1"
                >
                  <span>•</span>
                  <span>{item.ingredient.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default ReadyToCookTooltip;
