"use client";

import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useCreateIngredient } from "@/features/ingredient/hooks/useCreateIngredient";
import { ICategory } from "@/lib/prisma.args";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import IsInStockField from "./fields/IsInStockField";
import NameField from "./fields/NameField";

interface Props {
  categories: ICategory[];
}

const NewIngredientForm = ({ categories }: Props) => {
  const { id } = categories[0];
  const { mutate } = useCreateIngredient();
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

  const onSubmit = (values: ICreateIngredientFormValues) => {
    mutate(values, {
      onSuccess: () => {
        reset({
          description: "",
          isInStock: false,
          title: "",
          categoryId: values.categoryId,
        });
        toast.success("Ingredient created successfully!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
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
