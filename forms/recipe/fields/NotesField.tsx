import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const NotesField = () => {
  const { control } = useFormContext<IRecipeDto>();
  return (
    <Controller
      name="notes"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Notes</FieldLabel>
          <Input {...field} placeholder="Notes" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default NotesField;
