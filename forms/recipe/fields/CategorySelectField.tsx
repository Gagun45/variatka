import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { IRecipeCategory } from "@/lib/prisma.args";
import { ICreateRecipeFormValues } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  categories: IRecipeCategory[];
};

const CategorySelectField = ({ categories }: Props) => {
  const { control } = useFormContext<ICreateRecipeFormValues>();

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
