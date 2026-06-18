"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { IRecipeDto } from "@/zod/recipe.schema";
import CategorySelectField from "./fields/CategorySelectField";
import DescriptionField from "./fields/DescriptionField";
import NotesField from "./fields/NotesField";
import TitleField from "./fields/TitleField";
import InStockField from "./fields/InStockField";

interface Props {
  categories: IRecipeCategory[];
  onSubmit: (dto: IRecipeDto) => void;
  recipe?: IRecipe;
  isDisabled?: boolean;
  isPending: boolean;
}

const RecipeForm = ({
  categories,
  onSubmit,
  recipe,
  isPending,
  isDisabled,
}: Props) => {
  const schema = zodSchemas.recipe.create;
  const defaultValues: IRecipeDto = {
    recipeCategoryId: recipe?.recipeCategoryId ?? categories[0].id,
    description: recipe?.description ?? "",
    notes: recipe?.notes ?? "",
    title: recipe?.title ?? "",
    inStock: recipe?.inStock ?? 0,
  };
  const form = useForm<IRecipeDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField categories={categories} />
          <TitleField />
          <DescriptionField />
          <NotesField />
          <InStockField />

          <Button
            type="reset"
            className="w-full"
            disabled={!isDirty}
            variant={"destructive"}
            onClick={() => reset()}
          >
            Reset
          </Button>
          <LoadingButton
            isPending={isPending}
            disabled={!isDirty || isDisabled}
            type="submit"
          >
            {recipe ? "Save" : isDisabled ? "Set amounts!" : "Add"}
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
