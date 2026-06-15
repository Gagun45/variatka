import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Controller, useFormContext } from "react-hook-form";
import type { IIngredientFormValues } from "@/zod/ingredient.schema";
import { IIngredientCategory } from "@/lib/prisma.args";

type Props = {
  categories: IIngredientCategory[];
};

const CategorySelectField = ({ categories }: Props) => {
  const { control } = useFormContext<IIngredientFormValues>();

  return (
    <Controller
      name="categoryId"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Category</FieldLabel>

          <Select
            value={field.value?.toString()}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.title}
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
