import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { IIngredientFormValues } from "@/zod/ingredient.schema";
import { Controller, useFormContext } from "react-hook-form";

const IsInStockField = () => {
  const { control } = useFormContext<IIngredientFormValues>();

  return (
    <Controller
      name="isInStock"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel
            htmlFor="isinstock"
            className={`
          flex items-center justify-between rounded-md border px-4 py-3 font-medium transition cursor-pointer
          ${field.value ? "border-green-600!" : "border-red-600"}
        `}
          >
            <span className="text-sm">Is in stock</span>

            <Switch
              id="isinstock"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-600! scale-110"
            />
          </FieldLabel>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default IsInStockField;
