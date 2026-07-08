"use client";

import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import RecipeForm from "@/forms/recipe/RecipeForm";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useRecipeStore } from "@/zustand/recipe.store";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, List, PackagePlus, TriangleAlert } from "lucide-react";
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
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
          aria-label={`Open recipe draft, ${items.length} ingredient${items.length !== 1 ? "s" : ""}`}
        >
          <List className="size-4.5" />

          {items.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full border-2 border-sidebar bg-primary px-1 text-[10px] leading-none text-primary-foreground shadow-sm">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 bg-background sm:max-w-2xl">
        <SheetHeader className="border-b bg-card px-5 py-5 pr-12">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="size-5 text-muted-foreground" />
                Recipe draft
              </SheetTitle>
              <SheetDescription>
                Build an admin recipe from selected ingredients.
              </SheetDescription>
            </div>

            <Badge variant={isAmountNotSet ? "destructive" : "secondary"}>
              {statusLabel}
            </Badge>
          </div>

          <SheetDescription>
            Add amounts, review ingredient coverage, then save the recipe.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <PackagePlus className="size-6" />
              </div>
              <h3 className="text-base font-medium">No ingredients selected</h3>
              <p className="mt-1 max-w-80 text-sm text-muted-foreground">
                Add ingredients from the admin ingredient list to start a
                recipe draft.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isAmountNotSet && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>Set an amount for every ingredient before saving.</p>
                </div>
              )}

              <section className="rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-3 border-b p-4">
                  <div>
                    <h3 className="text-sm font-medium">Ingredients</h3>
                    <p className="text-xs text-muted-foreground">
                      {items.length} selected for this draft
                    </p>
                  </div>
                  <Badge variant="secondary">{completedItemsCount} filled</Badge>
                </div>
                <div className="p-3">
                  <RecipeItemsList items={items} />
                </div>
              </section>

              <Separator />

              <section className="rounded-xl border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium">Recipe details</h3>
                  <p className="text-xs text-muted-foreground">
                    Draft changes are saved locally while you work.
                  </p>
                </div>
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
