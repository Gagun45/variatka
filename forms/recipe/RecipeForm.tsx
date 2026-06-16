"use client";

import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import RecipeItemsList from "@/components/recipe-draft-sheet/list/RecipeItemsList";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { useCreateRecipe } from "@/features/recipe/hooks/useCreateRecipe";
import { IRecipe, IRecipeCategory } from "@/lib/prisma.args";
import { useRecipeStore } from "@/prisma/store/recipe";
import { IRecipeDto } from "@/zod/recipe.schema";
import CategorySelectField from "./fields/CategorySelectField";
import DescriptionField from "./fields/DescriptionField";
import NotesField from "./fields/NotesField";
import TitleField from "./fields/TitleField";

interface Props {
  categories: IRecipeCategory[];
  onSubmit: (dto: IRecipeDto) => void;
  recipe?: IRecipe;
  isPending: boolean;
  message?: string;
}

const RecipeForm = ({
  categories,
  onSubmit,
  recipe,
  isPending,
  message,
}: Props) => {
  const schema = zodSchemas.recipe.create;
  const defaultValues: IRecipeDto = {
    categoryId: recipe?.recipeCategoryId ?? categories[0].id,
    description: recipe?.description ?? "",
    notes: recipe?.notes ?? "",
    title: recipe?.title ?? "",
  };
  const form = useForm<IRecipeDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { handleSubmit, reset } = form;
  // const onSubmit = async (values: IRecipeDto) => {
  //   const noAmount = items.some((i) => !i.amount);
  //   if (noAmount) {
  //     setError("root", { message: "Some items has no amount set!" });
  //     return;
  //   }
  //   mutate(
  //     {
  //       ...values,
  //       items: items.map((i) => ({
  //         amount: i.amount,
  //         ingredientId: i.ingredient.id,
  //       })),
  //     },
  //     {
  //       onSuccess: () => {
  //         reset();
  //         clear();
  //         toast.success("Recipe created!");
  //       },
  //       onError: () => {
  //         toast.error("Something went wrong");
  //       },
  //     },
  //   );
  // };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField categories={categories} />
          <TitleField />
          <DescriptionField />
          <NotesField />

          <Button
            type="reset"
            className="w-full"
            variant={"destructive"}
            onClick={() => reset()}
          >
            Reset
          </Button>
          {message && <p className="text-sm text-destructive">{message}</p>}
          <LoadingButton isPending={isPending} type="submit">
            Create recipe
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default RecipeForm;
