import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RECIPE_SERIES_OPTIONS } from "@/lib/enumslist/series.constants";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

// Dynamically generate the options from your constants

const SeriesField = () => {
  const { control } = useFormContext<IRecipeDto>();

  return (
    <Controller
      name="series" // Ensure this matches your Zod schema property name
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Recipe Series</FieldLabel>

          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex flex-wrap gap-4"
          >
            {RECIPE_SERIES_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center border px-3 py-1.5 rounded-sm gap-2 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`series-${option.value}`}
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

export default SeriesField;
