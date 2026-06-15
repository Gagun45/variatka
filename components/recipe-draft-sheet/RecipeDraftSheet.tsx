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

const RecipeDraftSheet = () => {
  const items = useRecipeStore((s) => s.items);
  const { data: categories } = useRecipeCategories();
  if (!categories) return <p>No recipe categories</p>;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ingredients ({items.length})</Button>
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
              No ingredients added yet.
            </p>
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
