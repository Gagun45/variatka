import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ICreateIngredientFormValues } from "@/zod/ingredient.schema";
import { Controller, useFormContext } from "react-hook-form";

const IsInStockField = () => {
  const { control } = useFormContext<ICreateIngredientFormValues>();

  return (
    <Controller
      name="isInStock"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <div className="flex items-center gap-3">
            <FieldLabel>Is in stock</FieldLabel>

            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default IsInStockField;
