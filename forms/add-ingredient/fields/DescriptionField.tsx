import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Controller, useFormContext } from "react-hook-form";

const DescriptionField = () => {
  const { control } = useFormContext<IIngredientFormValues>();
  return (
    <Controller
      name="description"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Input {...field} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default DescriptionField;
