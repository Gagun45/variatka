import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { RECIPE_CATEGORY_ONLY_OPTIONS } from "@/lib/enumslist/recipe.constants";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const CategorySelectField = () => {
  const { control } = useFormContext<IRecipeDto>();

  return (
    <Controller
      name="category"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Category</FieldLabel>

          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {RECIPE_CATEGORY_ONLY_OPTIONS.map((opt) => (
                <SelectItem key={opt.label} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default CategorySelectField;
