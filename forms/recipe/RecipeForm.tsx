"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import RecipeItemsList from "@/components/recipe-draft-sheet/list/RecipeItemsList";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import { useRecipeStore } from "@/prisma/store/recipe";
import { ICreateRecipeFormValues } from "@/zod/recipe.schema";
import { toast } from "sonner";
import DescriptionField from "./fields/DescriptionField";
import NotesField from "./fields/NotesField";
import TitleField from "./fields/TitleField";
import { IRecipeCategory } from "@/lib/prisma.args";
import CategorySelectField from "./fields/CategorySelectField";

interface Props {
  categories: IRecipeCategory[];
}

const RecipeForm = ({ categories }: Props) => {
  const categoryId = categories[0].id;
  const items = useRecipeStore((s) => s.items);
  const clear = useRecipeStore((s) => s.clear);
  const { mutate, isPending } = useCreateRecipe();
  const schema = zodSchemas.recipe.create;
  const form = useForm<ICreateRecipeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
      categoryId,
    },
  });
  const { reset, handleSubmit, setError } = form;
  const onSubmit = async (values: ICreateRecipeFormValues) => {
    const noAmount = items.some((i) => !i.amount);
    if (noAmount) {
      setError("root", { message: "Some items has no amount set!" });
      return;
    }
    mutate(
      {
        ...values,
        items: items.map((i) => ({
          amount: i.amount,
          ingredientId: i.ingredient.id,
        })),
      },
      {
        onSuccess: () => {
          reset();
          clear();
          toast.success("Recipe created!");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-center text-2xl font-semibold tracking-widest">
          New recipe
        </p>
        <FieldSet disabled={isPending}>
          <CategorySelectField categories={categories} />
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
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <LoadingButton isPending={isPending} type="submit">
            Create recipe
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
