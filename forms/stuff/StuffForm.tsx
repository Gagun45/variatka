"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { FieldSet } from "@/components/ui/field";
import { IStuff } from "@/lib/prisma.args";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ICreateStuffDto } from "@/zod/stuff.schema";
import { useEffect } from "react";
import CategorySelectField from "./fields/CategoryField";
import DescriptionField from "./fields/DescriptionField";
import InStockField from "./fields/InStockField";
import TitleField from "./fields/TitleField";
import { IStuffCategory } from "@/lib/enumslist/stuff.constants";

interface Props {
  onClick: (dto: ICreateStuffDto) => void;
  initialCategory?: IStuffCategory;
  stuff?: IStuff;
  isPending: boolean;
  onReset?: () => void;
}

const StuffForm = ({
  onClick,
  stuff,
  isPending,
  initialCategory = "DECOR",
  onReset,
}: Props) => {
  const defaultCategory = stuff?.category ?? initialCategory;
  const schema = zodSchemas.stuff.create;
  const defaultValues: ICreateStuffDto = {
    title: stuff?.title ?? "",
    description: stuff?.description ?? "",
    inStock: stuff?.inStock ?? 0,
    category: defaultCategory,
  };
  const form = useForm<ICreateStuffDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    form.reset({
      title: stuff?.title ?? "",
      description: stuff?.description ?? "",
      inStock: stuff?.inStock ?? 0,
      category: stuff?.category ?? initialCategory,
    });
  }, [form, stuff, initialCategory]);

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const handleReset = () => {
    reset();
    if (onReset) onReset();
  };

  const onSubmit = (dto: ICreateStuffDto) => {
    onClick(dto);
    if (!stuff) {
      reset({
        description: "",
        inStock: 0,
        title: "",
        category: initialCategory,
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-2">
        <FieldSet disabled={isPending} className="space-y-4">
          <CategorySelectField />
          <TitleField />
          <DescriptionField />
          <InStockField />
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              disabled={!isDirty}
              type="button"
              variant={"destructive"}
              onClick={handleReset}
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

export default StuffForm;
