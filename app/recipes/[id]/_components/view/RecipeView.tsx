import { IRecipe } from "@/lib/prisma.args";

interface Props {
  recipe: IRecipe;
}

const RecipeView = ({ recipe }: Props) => {
  const { description, ingredients, notes, recipeCategory, title } = recipe;
  return (
    <div className="flex flex-col gap-4">
      <span>Category: {recipeCategory.title}</span>
      <span>Title: {title}</span>
      <span>Description: {description}</span>
      <span>Notes: {notes}</span>
      <div className="flex flex-col gap-2 bg-gray-400 p-2">
        {ingredients.map((ing) => (
          <div key={ing.ingredientId}>
            {ing.ingredient.title} - {ing.amount}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeView;
