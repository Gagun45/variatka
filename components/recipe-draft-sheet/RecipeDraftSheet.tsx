import RecipeForm from "@/forms/recipe/RecipeForm";
import { useRecipeStore } from "@/prisma/store/recipe";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useRecipeCategories } from "@/features/recipe/hooks/useRecipeCategories";
import Loader from "../loader/Loader";
import { List } from "lucide-react";
import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import { IRecipeDto } from "@/zod/recipe.schema";
import RecipeItemsList from "./list/RecipeItemsList";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

const RecipeDraftSheet = () => {
  const items = useRecipeStore((s) => s.items);
  const clear = useRecipeStore((s) => s.clear);
  const { data: categories, isLoading, isError } = useRecipeCategories();
  const [msg, setMsg] = useState("");
  const { mutate, isPending } = useCreateRecipe();
  if (isLoading) return <Loader />;
  if (isError || !categories) return <p>No recipe categories</p>;
  const onSubmit = (values: IRecipeDto) => {
    setMsg("");
    const noAmount = items.some((i) => !i.amount);
    if (noAmount) {
      setMsg("Some items has no amount set!");
      return;
    }
    mutate(
      {
        ...values,
        items: items.map((i) => ({
          amount: i.amount,
          ingredientId: i.ingredient.id,
        })),
      },
      {
        onSuccess: () => {
          clear();
          toast.success("Recipe created!");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <List />

          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Recipe Ingredients</SheetTitle>
          <SheetDescription>
            Manage ingredients for your recipe draft. Add amounts and review
            selected items before saving.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4 overflow-y-auto space-y-8">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ingredients added yet
            </p>
          ) : categories.length === 0 ? (
            <p>Add recipe category!</p>
          ) : (
            <>
              <p className="text-center text-2xl">New recipe</p>
              <RecipeItemsList items={items} />
              <Separator />
              <RecipeForm
                isPending={isPending}
                onSubmit={onSubmit}
                categories={categories}
                message={msg}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipeDraftSheet;
