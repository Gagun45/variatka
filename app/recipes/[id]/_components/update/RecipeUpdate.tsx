import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import { useUpdateRecipeFields } from "@/features/recipe/hooks/useUpdateRecipeFields";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { IRecipe } from "@/lib/prisma.args";
import { IRecipeDto } from "@/zod/recipe.schema";
import { toast } from "sonner";

interface Props {
  recipe: IRecipe;
}

const RecipeUpdate = ({ recipe }: Props) => {
  const { data: categories, isLoading, isError } = useRecipeCategories();
  const { mutate, isPending } = useUpdateRecipeFields();
  const onSubmit = (dto: IRecipeDto) => {
    console.log(dto);
    mutate(
      {
        dto,
        id: recipe.id,
      },
      {
        onSuccess: () => {
          toast.success("Recipe updated!");
        },
        onError: (e) => {
          toast.error(e.message);
        },
      },
    );
  };
  if (isLoading) return <Loader />;
  if (isError || !categories)
    return <StateScreen title="Something went wrong" />;
  return (
    <>
      <RecipeForm
        onSubmit={onSubmit}
        isPending={isPending}
        recipe={recipe}
        categories={categories}
      />
      <div className="flex flex-col border p-1">
        {recipe.ingredients.map((ing) => (
          <div key={ing.ingredientId} className="bg-gray-500 p-1">
            {ing.ingredient.title} - {ing.amount}
          </div>
        ))}
      </div>
    </>
  );
  // return
};

export default RecipeUpdate;
