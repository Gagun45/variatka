import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
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
          <Textarea {...field} placeholder="Notes" rows={3} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default NotesField;
