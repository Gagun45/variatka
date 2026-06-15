"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
  const form = useForm<formType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });
  const onSubmit = async (values: formType) => {
    const { message, success } = await createCategory(values);
    if (success) {
      form.reset();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Input {...field} placeholder="Aasd asd" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button type="submit">Add category</Button>
    </form>
  );
};

export default NewCategoryForm;
