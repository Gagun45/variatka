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
import { Badge } from "@/components/ui/badge";

interface Props {
  category: ICategory;
}

const NewIngredientForm = ({ category }: Props) => {
  const { id, title } = category;
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
  useEffect(() => {
    form.setValue("categoryId", id);
  }, [id, form]);
  const onSubmit = async (values: ICreateIngredientFormValues) => {
    const { message, success } = await createIngredient(values);
    if (success) {
      reset();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center">
          <Badge variant="secondary" className="h-10 text-lg w-full">
            Creating: {title}
          </Badge>
        </div>
        <FieldSet disabled={isSubmitting} className="space-y-4">
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
