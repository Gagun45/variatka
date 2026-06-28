import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

export const SpicyOptions = [
  {
    value: 0,
    label: "Not set",
    tooltip: "Spiciness not specified",
  },
  {
    value: 1,
    label: "Not spicy",
    tooltip: "Not spicy",
  },
  {
    value: 2,
    label: "🌶️",
    tooltip: "Mild",
  },
  {
    value: 3,
    label: "🌶️🌶️",
    tooltip: "Medium",
  },
  {
    value: 4,
    label: "🌶️🌶️🌶️",
    tooltip: "Hot",
  },
] as const;

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
            {SpicyOptions.map((option) => (
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
