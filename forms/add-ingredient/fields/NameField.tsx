import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Controller, useFormContext } from "react-hook-form";

const NameField = () => {
  const { control } = useFormContext<IIngredientFormValues>();
  return (
    <Controller
      name="title"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input {...field} placeholder="Name" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default NameField;
