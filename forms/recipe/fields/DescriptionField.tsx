import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICreateRecipeFormValues } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const DescriptionField = () => {
  const { control } = useFormContext<ICreateRecipeFormValues>();
  return (
    <Controller
      name="description"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Input {...field} placeholder="Description" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default DescriptionField;
