"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ICreateRecipeFormValues } from "@/zod/recipe.schema";
import TitleField from "./fields/TitleField";
import DescriptionField from "./fields/DescriptionField";
import NotesField from "./fields/NotesField";
import RecipeItemsList from "@/components/recipe-draft-sheet/list/RecipeItemsList";
import { createRecipe } from "@/lib/actions";
import { useRecipeStore } from "@/prisma/store/recipe";
import { toast } from "sonner";
import { FieldSet } from "@/components/ui/field";

const RecipeForm = () => {
  const items = useRecipeStore((s) => s.items);
  const clear = useRecipeStore((s) => s.clear);
  const schema = zodSchemas.recipe.create;
  const form = useForm<ICreateRecipeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
    },
  });
  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = form;
  const onSubmit = async (values: ICreateRecipeFormValues) => {
    const noAmount = items.some((i) => !i.amount);
    if (noAmount) {
      setError("root", { message: "Some items has no amount set!" });
      return;
    }
    const { message, success } = await createRecipe(values, items);
    if (success) {
      reset();
      clear();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-center text-2xl font-semibold tracking-widest">
          New recipe
        </p>
        <FieldSet disabled={isSubmitting}>
          <TitleField />
          <DescriptionField />
          <NotesField />

          <RecipeItemsList items={items} />

          <Button
            type="reset"
            className="w-full"
            variant={"destructive"}
            onClick={clear}
          >
            Clear
          </Button>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add recipe"}
          </Button>
        </FieldSet>

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
