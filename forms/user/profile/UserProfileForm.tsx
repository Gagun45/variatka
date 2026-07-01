"use client";

import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { IUser } from "@/lib/types";
import { IUpdateUserProfileDto } from "@/zod/user.schema";
import NameField from "./fields/NameField";
import OrderNameField from "./fields/OrderNameField";
import OrderPhoneField from "./fields/OrderPhoneField";
import { Separator } from "@/components/ui/separator";

interface Props {
  onCreate: (dto: IUpdateUserProfileDto) => void;
  user: IUser;
  isPending: boolean;
}

const UserProfileForm = ({ onCreate, isPending, user }: Props) => {
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

  const onSubmit = (dto: IUpdateUserProfileDto) => {
    onCreate(dto);
  };

  return (
    <Card className="border-muted max-w-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Account Details
        </CardTitle>
        <CardDescription>
          Manage your profile and default shipping settings.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isPending} className="space-y-6">
              {/* Basic Account Info Fields */}
              <div className="space-y-4">
                {/* Visual read-only display for Email to match ProfileView height */}
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">Email</span>
                  <span className="text-sm font-medium text-muted-foreground/70">
                    {user.email}
                  </span>
                </div>
                <Separator />
                <NameField />
              </div>

              {/* Grouped Checkout Defaults (Matches ProfileView styling perfectly) */}
              <div className="rounded-lg bg-muted/40 p-4 border border-muted/60 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Checkout defaults
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    These values are used to pre-fill your order form. You can
                    change them when placing an order.
                  </p>
                </div>

                <Separator className="bg-muted-foreground/10" />

                <div className="space-y-4">
                  <OrderNameField />
                  <OrderPhoneField />
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex justify-center gap-4 pt-2">
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
                  Save changes
                </LoadingButton>
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
