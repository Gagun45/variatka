"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { FieldSet } from "@/components/ui/field";
import { IIngredient, IIngredientCategory } from "@/lib/prisma.args";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import IsInStockField from "./fields/IsInStockField";
import NameField from "./fields/NameField";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Props {
  categories: IIngredientCategory[];
  onClick: (dto: IIngredientFormValues) => void;
  ingredient?: IIngredient;
  isPending: boolean;
}

const IngredientForm = ({
  categories,
  onClick,
  ingredient,
  isPending,
}: Props) => {
  const { id } = categories[0];

  const schema = zodSchemas.ingredient.create;
  const defaultValues: IIngredientFormValues = {
    title: ingredient?.title ?? "",
    description: ingredient?.description ?? "",
    categoryId: ingredient?.categoryId ?? id,
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
      categoryId: ingredient?.categoryId ?? categories[0]?.id ?? "",
      isInStock: ingredient?.isInStock ?? false,
    });
  }, [ingredient, categories, form]);

  const { handleSubmit, reset } = form;

  const onSubmit = (dto: IIngredientFormValues) => {
    onClick(dto);
    if (!ingredient) {
      reset({
        description: "",
        categoryId: dto.categoryId,
        isInStock: dto.isInStock,
        title: "",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField categories={categories} />
          <NameField />
          <DescriptionField />
          <IsInStockField />
          <Button type="button" variant={"destructive"} onClick={() => reset()}>
            Reset
          </Button>
          <LoadingButton isPending={isPending} type="submit">
            {ingredient ? "Save" : "Add"}
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default IngredientForm;
