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

interface Props {
  category: ICategory;
}

const NewIngredientForm = ({ category }: Props) => {
  const { id, name } = category;
  const schema = zodSchemas.ingredient.create;
  const form = useForm<ICreateIngredientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: id,
      isInStock: false,
    },
  });
  useEffect(() => {
    form.setValue("categoryId", id);
  }, [id, form]);
  const onSubmit = async (values: ICreateIngredientFormValues) => {
    const { message, success } = await createIngredient(values);
    if (success) {
      form.reset();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <span>Creating: {name}</span>
        <NameField />
        <DescriptionField />
        <IsInStockField />
        <Button type="submit">Add ingredient</Button>
      </form>
    </FormProvider>
  );
};

export default NewIngredientForm;
