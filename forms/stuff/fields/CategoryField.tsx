import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { IStuffCategory } from "@/lib/prisma.args";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  categories: IStuffCategory[];
};

const CategorySelectField = ({ categories }: Props) => {
  const { control } = useFormContext<ICreateStuffDto>();

  return (
    <Controller
      name="stuffCategoryId"
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
