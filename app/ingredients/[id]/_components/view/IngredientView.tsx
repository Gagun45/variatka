import { IIngredient } from "@/lib/prisma.args";

interface Props {
  ingredient: IIngredient;
}
const IngredientView = ({ ingredient }: Props) => {
  const { description, title, category, isInStock } = ingredient;
  return (
    <div className="flex flex-col gap-4">
      <span>Category: {category.title}</span>
      <span>Title: {title}</span>
      <span>Description: {description}</span>
      <span>Is in stock: {isInStock ? "Yes" : "No"}</span>
    </div>
  );
};

export default IngredientView;
