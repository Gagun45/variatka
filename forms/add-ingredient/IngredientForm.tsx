"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { FieldSet } from "@/components/ui/field";
import { IIngredient } from "@/lib/prisma.args";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import IsInStockField from "./fields/IsInStockField";
import TitleField from "./fields/TitleField";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { IIngredientCategory } from "@/lib/enumslist/ingredient.constants";

interface Props {
  onCreate: (dto: IIngredientFormValues) => void;
  ingredient?: IIngredient;
  isPending: boolean;
  initialCategory?: IIngredientCategory;
}

const IngredientForm = ({
  onCreate,
  ingredient,
  isPending,
  initialCategory,
}: Props) => {
  const defaultCategory: IIngredientCategory = initialCategory ?? "SPICES";

  const schema = zodSchemas.ingredient.create;
  const defaultValues: IIngredientFormValues = {
    title: ingredient?.title ?? "",
    description: ingredient?.description ?? "",
    category: ingredient?.category ?? defaultCategory,
    isInStock: ingredient?.isInStock ?? false,
  };
  const form = useForm<IIngredientFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    form.reset({
      title: ingredient?.title ?? "",
      description: ingredient?.description ?? "",
      category: ingredient?.category ?? defaultCategory,
      isInStock: ingredient?.isInStock ?? false,
    });
  }, [ingredient, form, defaultCategory]);

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const onSubmit = (dto: IIngredientFormValues) => {
    onCreate(dto);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-2">
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField />
          <TitleField />
          <DescriptionField />
          <IsInStockField />
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              disabled={!isDirty}
              type="button"
              variant={"destructive"}
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton
              disabled={!isDirty}
              isPending={isPending}
              type="submit"
            >
              {ingredient ? "Save" : "Add"}
            </LoadingButton>
          </div>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default IngredientForm;
