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
          <FieldLabel className="text-sm">Recipient name</FieldLabel>
          <Input {...field} placeholder="Name for order forms" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default OrderNameField;
