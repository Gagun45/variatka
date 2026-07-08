"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { useDebouncedCallback } from "use-debounce";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { IRecipeDto } from "@/zod/recipe.schema";
import { RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import CategorySelectField from "./fields/CategorySelectField";
import ConfirmationNotesField from "./fields/ConfirmationNotesField";
import DescriptionField from "./fields/DescriptionField";
import InStockField from "./fields/InStockField";
import IsConfirmedField from "./fields/IsConfirmedField";
import NotesField from "./fields/NotesField";
import SeriesField from "./fields/SeriesField";
import SpicyField from "./fields/SpicyField";
import TitleField from "./fields/TitleField";
import { IRecipeCategory } from "@/lib/enumslist/recipe.constants";
import IsHiddenField from "./fields/IsHiddenField";

interface Props {
  onSubmit: (dto: IRecipeDto) => void;
  initialValues?: IRecipeDto;
  isDisabled?: boolean;
  isPending: boolean;
  onDraftChange?: (data: Partial<IRecipeDto>) => void;
  onReset?: () => void;
  submitLabel?: string;
  layout?: "page" | "sheet";
}

const RecipeForm = ({
  onSubmit,
  initialValues,
  isPending,
  isDisabled,
  onDraftChange,
  onReset,
  submitLabel,
  layout = "page",
}: Props) => {
  const schema = zodSchemas.recipe.create;
  const initialCategory: IRecipeCategory = initialValues?.category ?? "SPICES";
  const defaultValues: IRecipeDto = {
    description: initialValues?.description ?? "",
    notes: initialValues?.notes ?? "",
    title: initialValues?.title ?? "",
    inStock: initialValues?.inStock ?? 0,
    confirmationNotes: initialValues?.confirmationNotes ?? "",
    isConfirmed: initialValues?.isConfirmed ?? false,
    spicy: initialValues?.spicy ?? 0,
    series: initialValues?.series ?? "DEFAULT",
    category: initialCategory,
    isHidden: initialValues?.isHidden ?? false,
  };
  const form = useForm<IRecipeDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const watchedValues = useWatch({ control: form.control });
  const isSheetLayout = layout === "sheet";

  const setDraftDebounced = useDebouncedCallback(
    (values: Partial<IRecipeDto>) => {
      if (!onDraftChange) return;
      onDraftChange(values);
    },
    300,
  );
  useEffect(() => {
    if (!onDraftChange) return;

    setDraftDebounced({
      title: watchedValues.title ?? "",
      description: watchedValues.description ?? "",
      notes: watchedValues.notes ?? "",
      inStock: watchedValues.inStock ?? 0,
      category: watchedValues.category ?? initialCategory,
      confirmationNotes: watchedValues.confirmationNotes ?? "",
      isConfirmed: watchedValues.isConfirmed ?? false,
      spicy: watchedValues.spicy ?? 0,
      series: watchedValues.series ?? "DEFAULT",
      isHidden: watchedValues.isHidden ?? false,
    });
  }, [watchedValues, setDraftDebounced, initialCategory, onDraftChange]);
  const { handleSubmit, reset } = form;
  const handleReset = () => {
    reset();
    if (onReset) {
      onReset();
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet
          disabled={isPending}
          className={cn(isSheetLayout ? "gap-4" : "gap-6")}
        >
          <div className={cn("grid gap-4", !isSheetLayout && "lg:grid-cols-2")}>
            <div className="grid gap-4">
              <CategorySelectField />
              <TitleField />
              <DescriptionField />
            </div>
            <div className="grid gap-4 content-start">
              <SeriesField />
              <NotesField />
            </div>
          </div>

          <section
            className={cn(
              "rounded-xl p-4",
              isSheetLayout
                ? "bg-muted/40"
                : "border bg-muted/20 sm:p-5",
            )}
          >
            <div className="mb-4">
              <h4 className="text-sm font-medium">Publishing controls</h4>
              <p className="text-xs text-muted-foreground">
                Configure stock, visibility, and review state.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InStockField />
              <SpicyField />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <IsConfirmedField />
              <IsHiddenField />
            </div>
            <div className="mt-4">
              <ConfirmationNotesField />
            </div>
          </section>

          <div
            className={cn(
              "flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end",
              isSheetLayout && "sticky bottom-0 -mx-4 bg-card/95 px-4 pb-1",
            )}
          >
            <Button
              type="reset"
              variant="outline"
              onClick={handleReset}
              className="sm:w-auto"
            >
              <RotateCcw className="size-4" />
              {onReset ? "Reset draft" : "Reset form"}
            </Button>
            <LoadingButton
              isPending={isPending}
              disabled={isDisabled}
              type="submit"
              className="sm:min-w-32"
            >
              {isDisabled ? (
                "Set amounts"
              ) : (
                <>
                  <Save className="size-4" />
                  {submitLabel ??
                    (initialValues ? "Save recipe" : "Add recipe")}
                </>
              )}
            </LoadingButton>
          </div>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
