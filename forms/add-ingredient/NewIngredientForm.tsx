"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { FieldSet } from "@/components/ui/field";
import { useCreateIngredient } from "@/features/ingredient/hooks/useCreateIngredient";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import IsInStockField from "./fields/IsInStockField";
import NameField from "./fields/NameField";
import { IIngredientCategory } from "@/lib/prisma.args";

interface Props {
  categories: IIngredientCategory[];
}

const NewIngredientForm = ({ categories }: Props) => {
  const { id } = categories[0];
  const { mutate, isPending } = useCreateIngredient();
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
  const { handleSubmit, reset } = form;

  const onSubmit = (values: ICreateIngredientFormValues) => {
    mutate(values, {
      onSuccess: () => {
        reset({
          description: "",
          isInStock: values.isInStock,
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
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField categories={categories} />
          <NameField />
          <DescriptionField />
          <IsInStockField />
          <LoadingButton isPending={isPending} type="submit">
            Add ingredient
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default NewIngredientForm;
