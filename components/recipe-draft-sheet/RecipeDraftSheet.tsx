"use client";

import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useRecipeStore } from "@/zustand/recipe.store";
import { List } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import RecipeItemsList from "./list/RecipeItemsList";

const RecipeDraftSheet = () => {
  const items = useRecipeStore((s) => s.items);
  const clear = useRecipeStore((s) => s.clear);
  const draft = useRecipeStore((s) => s.draft);
  const setDraft = useRecipeStore((s) => s.setDraft);
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateRecipe();
  const isAmountNotSet = items.some((i) => !i.amount);
  const onSubmit = (values: IRecipeDto) => {
    if (isAmountNotSet) {
      toast.error("Set all of the amounts");
      return;
    }
    mutate(
      {
        ...values,
        items: items.map((i) => ({
          amount: i.amount,
          ingredientId: i.id,
        })),
      },
      {
        onSuccess: () => {
          clear();
          setOpen(false);
        },
      },
    );
  };

  const onReset = () => {
    clear();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
      <SheetContent className="pb-4">
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
          ) : (
            <>
              <p className="text-center text-2xl">New recipe</p>
              <RecipeItemsList items={items} />
              <Separator />
              <RecipeForm
                isPending={isPending}
                onSubmit={onSubmit}
                isDisabled={isAmountNotSet}
                initialValues={draft}
                onDraftChange={setDraft}
                onReset={onReset}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipeDraftSheet;
