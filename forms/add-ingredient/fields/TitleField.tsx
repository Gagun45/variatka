import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Controller, useFormContext } from "react-hook-form";

const TitleField = () => {
  const { control } = useFormContext<IIngredientFormValues>();
  return (
    <Controller
      name="title"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input {...field} placeholder="Title" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default TitleField;
