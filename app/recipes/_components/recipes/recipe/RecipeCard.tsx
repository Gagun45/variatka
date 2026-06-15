import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeCard = ({ recipe }: Props) => {
  const { description, ingredients, title, notes } = recipe;
  return (
    <div className="border p-2 flex flex-col gap-2">
      <span>{title}</span>
      <span>{description}</span>
      <span>{notes}</span>
      <div className="flex flex-col bg-gray-500 p-2 gap-1">
        {ingredients.map(({ amount, ingredient }) => (
          <div key={ingredient.id}>
            <span>
              {ingredient.title} x {amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeCard;
