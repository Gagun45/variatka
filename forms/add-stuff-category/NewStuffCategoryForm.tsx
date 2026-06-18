"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateStuffCategory } from "@/features/stuff/hooks/useCreateStuffCategory";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const NewStuffCategoryForm = () => {
  const schema = zodSchemas.stuff.createCategory;
  const { mutate, isPending } = useCreateStuffCategory();
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
              <Input autoFocus {...field} placeholder="For example, Jars" />
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

export default NewStuffCategoryForm;
