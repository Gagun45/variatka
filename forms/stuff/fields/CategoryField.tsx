import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { Controller, useFormContext } from "react-hook-form";
import { STUFF_CATEGORY_ONLY_OPTIONS } from "@/lib/enumslist/stuff.constants";

const CategorySelectField = () => {
  const { control } = useFormContext<ICreateStuffDto>();

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
              {STUFF_CATEGORY_ONLY_OPTIONS.map((opt) => (
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
