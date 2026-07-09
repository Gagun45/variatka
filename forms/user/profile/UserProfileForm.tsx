"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IUser } from "@/lib/types";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import { Mail } from "lucide-react";
import NameField from "./fields/NameField";
import OrderNameField from "./fields/OrderNameField";
import OrderPhoneField from "./fields/OrderPhoneField";

interface Props {
  onSubmit: (dto: IUpdateUserProfileDto) => void;
  user: IUser;
  isPending: boolean;
}

const UserProfileForm = ({ onSubmit, isPending, user }: Props) => {
  const schema = zodSchemas.user.updateProfile;
  const defaultValues: IUpdateUserProfileDto = {
    name: user.name,
    orderName: user.orderName ?? "",
    orderPhone: user.orderPhone ?? "",
  };
  const form = useForm<IUpdateUserProfileDto>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const onSubmitHandle = (dto: IUpdateUserProfileDto) => {
    onSubmit(dto);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmitHandle)}>
        <fieldset disabled={isPending} className="space-y-6">
          <section className="space-y-4">
            <SectionHeader
              title="Account details"
              description="Update the name shown around the app."
            />

            <div className="overflow-hidden rounded-lg border border-border/70">
              <div className="grid gap-2 p-4 sm:grid-cols-[minmax(10rem,0.75fr)_1fr] sm:items-center">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="size-4" />
                  Email address
                </span>
                <span className="break-words text-sm font-medium text-muted-foreground sm:text-right">
                  {user.email}
                </span>
              </div>
              <Separator />
              <div className="p-4">
                <NameField />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-border/70 bg-muted/30 p-4">
            <SectionHeader
              title="Checkout defaults"
              description="Save contact details that should appear first on new orders."
            />

            <div className="space-y-4 rounded-lg border border-border/70 bg-background p-4">
              <OrderNameField />
              <OrderPhoneField />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={!isDirty}
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton
              disabled={!isDirty}
              isPending={isPending}
              type="submit"
            >
              Save changes
            </LoadingButton>
          </div>
        </fieldset>
      </form>
    </FormProvider>
  );
};

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default UserProfileForm;
