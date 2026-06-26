import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const options = [
  { value: 0, label: "Not set" },
  { value: 1, label: "Not spicy" },
  { value: 2, label: "🌶️" },
  { value: 3, label: "🌶️🌶️" },
  { value: 4, label: "🌶️🌶️🌶️" },
];

const SpicyField = () => {
  const { control } = useFormContext<IRecipeDto>();

  return (
    <Controller
      name="spicy"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Spicy Level</FieldLabel>

          <RadioGroup
            value={String(field.value)}
            onValueChange={(value) => field.onChange(Number(value))}
            className="flex flex-wrap gap-4"
          >
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center border px-2 py-1 rounded-sm gap-2 cursor-pointer"
              >
                <RadioGroupItem
                  value={String(option.value)}
                  id={`spicy-${option.value}`}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </RadioGroup>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default SpicyField;
