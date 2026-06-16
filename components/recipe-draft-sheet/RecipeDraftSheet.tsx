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

const RecipeDraftSheet = () => {
  const items = useRecipeStore((s) => s.items);
  const { data: categories, isLoading, isError } = useRecipeCategories();
  if (isLoading) return <Loader />;
  if (isError || !categories) return <p>No recipe categories</p>;

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
        <div className="mt-6 px-2 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ingredients added yet
            </p>
          ) : categories.length === 0 ? (
            <p>Add recipe category!</p>
          ) : (
            <>
              <RecipeForm categories={categories} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipeDraftSheet;
