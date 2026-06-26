"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { useDebouncedCallback } from "use-debounce";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { IRecipeCategory } from "@/lib/prisma.args";
import { IRecipeDto } from "@/zod/recipe.schema";
import { useEffect } from "react";
import CategorySelectField from "./fields/CategorySelectField";
import ConfirmationNotesField from "./fields/ConfirmationNotesField";
import DescriptionField from "./fields/DescriptionField";
import InStockField from "./fields/InStockField";
import IsConfirmedField from "./fields/IsConfirmedField";
import IsPremiumField from "./fields/IsPremiumField";
import NotesField from "./fields/NotesField";
import SpicyField from "./fields/SpicyField";
import TitleField from "./fields/TitleField";

interface Props {
  categories: IRecipeCategory[];
  onSubmit: (dto: IRecipeDto) => void;
  initialValues?: IRecipeDto;
  isDisabled?: boolean;
  isPending: boolean;
  onDraftChange?: (data: Partial<IRecipeDto>) => void;
  onReset?: () => void;
}

const RecipeForm = ({
  categories,
  onSubmit,
  initialValues,
  isPending,
  isDisabled,
  onDraftChange,
  onReset,
}: Props) => {
  const schema = zodSchemas.recipe.create;
  const initialRecipeCategoryId =
    initialValues?.recipeCategoryId && initialValues.recipeCategoryId !== 0
      ? initialValues.recipeCategoryId
      : categories[0].id;
  const defaultValues: IRecipeDto = {
    recipeCategoryId: initialRecipeCategoryId,
    description: initialValues?.description ?? "",
    notes: initialValues?.notes ?? "",
    title: initialValues?.title ?? "",
    inStock: initialValues?.inStock ?? 0,
    confirmationNotes: initialValues?.confirmationNotes ?? "",
    isConfirmed: initialValues?.isConfirmed ?? false,
    isPremium: initialValues?.isPremium ?? false,
    spicy: initialValues?.spicy ?? 0,
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
        recipeCategoryId: values.recipeCategoryId ?? 0,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, setDraftDebounced]);
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;
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
          <CategorySelectField categories={categories} />
          <TitleField />
          <DescriptionField />
          <NotesField />
          <InStockField />
          <SpicyField />
          <IsPremiumField />
          <IsConfirmedField />
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
            disabled={!isDirty || isDisabled}
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
