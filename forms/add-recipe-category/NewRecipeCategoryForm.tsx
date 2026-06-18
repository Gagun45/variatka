"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICreateRecipeCategoryDto } from "@/zod/recipe.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface Props {
  isPending: boolean;
  onCreate: (dto: ICreateRecipeCategoryDto) => void;
}

const NewRecipeCategoryForm = ({ isPending, onCreate }: Props) => {
  const schema = zodSchemas.recipe.createCategory;
  const { control, handleSubmit } = useForm<ICreateRecipeCategoryDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
    },
  });
  const onSubmit = (values: ICreateRecipeCategoryDto) => {
    onCreate(values);
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
