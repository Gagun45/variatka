"use client";

import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import NameField from "./fields/NameField";
import DescriptionField from "./fields/DescriptionField";
import IsInStockField from "./fields/IsInStockField";
import { createIngredient } from "@/lib/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ICategory } from "@/lib/prisma.args";
import { FieldSet } from "@/components/ui/field";
import CategorySelectField from "./fields/CategoryField";

interface Props {
  categories: ICategory[];
}

const NewIngredientForm = ({ categories }: Props) => {
  const { id } = categories[0];
  const schema = zodSchemas.ingredient.create;
  const form = useForm<ICreateIngredientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: id,
      isInStock: false,
    },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: ICreateIngredientFormValues) => {
    const { message, success } = await createIngredient(values);
    if (success) {
      reset({
        description: "",
        isInStock: false,
        title: "",
        categoryId: values.categoryId,
      });
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldSet disabled={isSubmitting} className="space-y-4">
          <CategorySelectField categories={categories} />
          <NameField />
          <DescriptionField />
          <IsInStockField />
          <Button type="submit">
            {isSubmitting ? "Adding..." : "Add ingredient"}
          </Button>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default NewIngredientForm;
