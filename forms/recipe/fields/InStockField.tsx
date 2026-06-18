import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IRecipeDto } from "@/zod/recipe.schema";

import { Controller, useFormContext } from "react-hook-form";

const InStockField = () => {
  const { control } = useFormContext<IRecipeDto>();

  return (
    <Controller
      name="inStock"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>In Stock</FieldLabel>

          <Input
            type="number"
            min={0}
            value={field.value ?? ""}
            onChange={(e) => {
              field.onChange(
                e.target.value === "" ? 0 : Number(e.target.value),
              );
            }}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default InStockField;
