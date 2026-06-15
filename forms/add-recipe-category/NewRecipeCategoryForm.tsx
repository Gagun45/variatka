"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateRecipeCategory } from "@/features/recipe/hooks/useCreateRecipeCategory";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const NewRecipeCategoryForm = () => {
  const schema = zodSchemas.recipe.createCategory;
  const { mutate, isPending } = useCreateRecipeCategory();
  type formType = z.infer<typeof schema>;
  const { control, reset, handleSubmit } = useForm<formType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });
  const onSubmit = (values: formType) => {
    mutate(values, {
      onSuccess: () => {
        reset();
        toast.success("Category created successfully!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={isPending}>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input autoFocus {...field} placeholder="For example, SAUCES" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <LoadingButton isPending={isPending} type="submit">
          Add category
        </LoadingButton>
      </FieldSet>
    </form>
  );
};

export default NewRecipeCategoryForm;
