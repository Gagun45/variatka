"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { useDebouncedCallback } from "use-debounce";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { IRecipeDto } from "@/zod/recipe.schema";
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
}

const RecipeForm = ({
  onSubmit,
  initialValues,
  isPending,
  isDisabled,
  onDraftChange,
  onReset,
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

  const setDraftDebounced = useDebouncedCallback(
    (values: Partial<IRecipeDto>) => {
      if (!onDraftChange) return;
      onDraftChange(values);
    },
    300,
  );
  useEffect(() => {
    const subscription = form.watch((values) => {
      setDraftDebounced({
        title: values.title ?? "",
        description: values.description ?? "",
        notes: values.notes ?? "",
        inStock: values.inStock ?? 0,
        category: values.category ?? initialCategory,
        confirmationNotes: values.confirmationNotes ?? "",
        isConfirmed: values.isConfirmed ?? false,
        spicy: values.spicy ?? 0,
        series: values.series ?? "DEFAULT",
        isHidden: values.isHidden ?? false,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, setDraftDebounced, initialCategory]);
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
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField />
          <TitleField />
          <DescriptionField />
          <NotesField />
          <InStockField />
          <SpicyField />
          <SeriesField />
          <IsConfirmedField />
          <IsHiddenField />
          <ConfirmationNotesField />
          <Button
            type="reset"
            className="w-full"
            variant={"destructive"}
            onClick={handleReset}
          >
            Reset
          </Button>
          <LoadingButton
            isPending={isPending}
            disabled={isDisabled}
            type="submit"
          >
            {isDisabled ? "Set amounts!" : initialValues ? "Save" : "Add"}
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
