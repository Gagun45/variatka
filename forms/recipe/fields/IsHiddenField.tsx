import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { IRecipeDto } from "@/zod/recipe.schema";
import { Controller, useFormContext } from "react-hook-form";

const IsHiddenField = () => {
  const { control } = useFormContext<IRecipeDto>();

  return (
    <Controller
      name="isHidden"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="w-fit">
          <div className="flex flex-row p-2 border rounded-md items-center gap-4 transition">
            <FieldLabel htmlFor="isHidden">Is hidden</FieldLabel>

            <div
              className={`rounded-md p-1 transition flex justify-center items-center
              ${field.value ? "ring-2 ring-green-500/40" : "ring-2 ring-red-500/30"}
              `}
            >
              <Switch
                id="isHidden"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default IsHiddenField;
