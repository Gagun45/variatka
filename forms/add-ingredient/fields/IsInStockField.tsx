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
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3 transition hover:bg-muted/50">
            <FieldLabel htmlFor="isinstock" className="text-sm font-medium">
              Is in stock
            </FieldLabel>

            <Switch
              id="isinstock"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-green-500 scale-110"
            />
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default IsInStockField;
