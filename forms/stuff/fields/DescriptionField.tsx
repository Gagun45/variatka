import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { Controller, useFormContext } from "react-hook-form";

const DescriptionField = () => {
  const { control } = useFormContext<ICreateStuffDto>();
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
