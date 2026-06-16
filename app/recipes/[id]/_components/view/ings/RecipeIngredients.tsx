import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeIngredients = ({ recipe }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Ingredients
      </h3>

      <div className="flex flex-col gap-2">
        {recipe.ingredients.map((ing) => (
          <div
            key={ing.ingredientId}
            className="flex items-center justify-between rounded-md border px-3 py-2"
          >
            <span className="font-medium">{ing.ingredient.title}</span>

            <span className="text-sm text-muted-foreground">{ing.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeIngredients;
