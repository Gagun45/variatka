import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { Controller, useFormContext } from "react-hook-form";

const OrderPhoneField = () => {
  const { control } = useFormContext<IUpdateUserProfileDto>();

  return (
    <Controller
      name="orderPhone"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel className="text-sm">Phone number</FieldLabel>

          <Input {...field} placeholder="+380 50 123 45 67" />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default OrderPhoneField;
