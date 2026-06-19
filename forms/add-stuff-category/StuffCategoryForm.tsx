"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICreateStuffCategoryDto } from "@/zod/stuff.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface Props {
  onSubmit: (values: ICreateStuffCategoryDto) => void;
  isPending: boolean;
}

const StuffCategoryForm = ({ onSubmit, isPending }: Props) => {
  const schema = zodSchemas.stuff.createCategory;
  const { control, handleSubmit } = useForm<ICreateStuffCategoryDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmitHandler = (values: ICreateStuffCategoryDto) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
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

export default StuffCategoryForm;
