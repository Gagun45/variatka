import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { Controller, useFormContext } from "react-hook-form";

const OrderNameField = () => {
  const { control } = useFormContext<IUpdateUserProfileDto>();
  return (
    <Controller
      name="orderName"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Default name</FieldLabel>
          <Input {...field} placeholder="Default name" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default OrderNameField;
