"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/lib/actions";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const NewCategoryForm = () => {
  const schema = zodSchemas.category.create;
  type formType = z.infer<typeof schema>;
  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<formType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });
  const onSubmit = async (values: formType) => {
    const { message, success } = await createCategory(values);
    if (success) {
      reset();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet disabled={isSubmitting}>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input {...field} placeholder="For example, SAUCES" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit">
          {isSubmitting ? "Adding..." : "Add category"}
        </Button>
      </FieldSet>
    </form>
  );
};

export default NewCategoryForm;
