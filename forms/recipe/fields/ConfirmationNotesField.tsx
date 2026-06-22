import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const ConfirmationNotesField = () => {
  const { control } = useFormContext<IRecipeDto>();
  return (
    <Controller
      name="confirmationNotes"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Confirmation notes</FieldLabel>
          <Textarea {...field} placeholder="Confirmation notes" rows={3} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default ConfirmationNotesField;
