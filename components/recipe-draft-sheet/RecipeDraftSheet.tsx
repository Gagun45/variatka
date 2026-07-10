"use client";

import IconButton from "@/components/icon-button/IconButton";
import { Badge } from "@/components/ui/badge";
import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useRecipeStore } from "@/zustand/recipe.store";
import { ClipboardList, List, PackagePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  const completedItemsCount = items.filter((i) => i.amount).length;
  const statusLabel =
    items.length > 0 ? `${completedItemsCount}/${items.length} ready` : "Empty";
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
        <IconButton
          variant="ghost"
          size="icon"
          className="relative"
          label={"Конструктор рецепту"}
        >
          <List className="size-4.5" />

          {items.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full border-2 border-sidebar bg-primary px-1 text-[10px] leading-none text-primary-foreground shadow-sm">
              {items.length}
            </span>
          )}
        </IconButton>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 bg-background sm:max-w-2xl">
        <SheetHeader className="border-b bg-card px-5 py-4 pr-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="size-5 text-muted-foreground" />
                Recipe draft
              </SheetTitle>
              <SheetDescription className="sr-only">
                Create a recipe draft from selected ingredients.
              </SheetDescription>
            </div>

            <Badge variant={isAmountNotSet ? "destructive" : "secondary"}>
              {statusLabel}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <PackagePlus className="size-6" />
              </div>
              <h3 className="text-base font-medium">No ingredients selected</h3>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-3 border-b p-4">
                  <h3 className="text-sm font-medium">
                    Ingredients - {items.length}
                  </h3>
                </div>
                <div className="p-3">
                  <RecipeItemsList items={items} />
                </div>
              </section>

              <section className="rounded-xl border bg-card p-4">
                <h3 className="mb-4 text-sm font-medium">Recipe details</h3>
                <RecipeForm
                  isPending={isPending}
                  onSubmit={onSubmit}
                  isDisabled={isAmountNotSet}
                  initialValues={draft}
                  onDraftChange={setDraft}
                  onReset={onReset}
                  submitLabel="Create recipe"
                  layout="sheet"
                />
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipeDraftSheet;
