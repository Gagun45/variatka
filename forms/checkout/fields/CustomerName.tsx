import RequiredLabelMark from "@/components/required-mark/RequiredLabelMark";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ICreateOrderFormValues } from "@/zod/order.schema";
import { Controller, useFormContext } from "react-hook-form";

const CustomerName = () => {
  const { control } = useFormContext<ICreateOrderFormValues>();
  return (
    <Controller
      name="customerName"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>
            Name <RequiredLabelMark />
          </FieldLabel>
          <Input {...field} placeholder="Enter your name" />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default CustomerName;
