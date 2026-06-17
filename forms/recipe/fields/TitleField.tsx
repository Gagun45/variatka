import RequiredLabelMark from "@/components/required-mark/RequiredLabelMark";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const TitleField = () => {
  const { control } = useFormContext<IRecipeDto>();
  return (
    <Controller
      name="title"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>
            Title
            <RequiredLabelMark />
          </FieldLabel>
          <Input {...field} placeholder="Title" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default TitleField;
