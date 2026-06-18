"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { FieldSet } from "@/components/ui/field";
import { IStuff, IStuffCategory } from "@/lib/prisma.args";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { useEffect } from "react";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import TitleField from "./fields/TitleField";
import InStockField from "./fields/InStockField";

interface Props {
  categories: IStuffCategory[];
  onClick: (dto: ICreateStuffDto) => void;
  stuff?: IStuff;
  isPending: boolean;
}

const NewStuffForm = ({ categories, onClick, stuff, isPending }: Props) => {
  const { id } = categories[0];

  const schema = zodSchemas.stuff.create;
  const defaultValues: ICreateStuffDto = {
    title: stuff?.title ?? "",
    description: stuff?.description ?? "",
    stuffCategoryId: stuff?.stuffCategoryId ?? id,
    inStock: stuff?.inStock ?? 0,
  };
  const form = useForm<ICreateStuffDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    form.reset({
      title: stuff?.title ?? "",
      description: stuff?.description ?? "",
      stuffCategoryId: stuff?.stuffCategoryId ?? id,
      inStock: stuff?.inStock ?? 0,
    });
  }, [stuff, categories, form, id]);

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const onSubmit = (dto: ICreateStuffDto) => {
    onClick(dto);
    if (!stuff) {
      reset({
        description: "",
        stuffCategoryId: dto.stuffCategoryId,
        inStock: 0,
        title: "",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-2">
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField categories={categories} />
          <TitleField />
          <DescriptionField />
          <InStockField />
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              disabled={!isDirty}
              type="button"
              variant={"destructive"}
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton
              disabled={!isDirty}
              isPending={isPending}
              type="submit"
            >
              {stuff ? "Save" : "Add"}
            </LoadingButton>
          </div>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default NewStuffForm;
