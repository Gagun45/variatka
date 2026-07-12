import { ICreateOrderFormValues } from "@/zod/order.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import CustomerName from "./fields/CustomerName";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  customerName?: string;
  customerEmail: string;
  onSubmit: (values: ICreateOrderFormValues) => void;
  isPending: boolean;
}

const CheckoutForm = ({
  customerEmail,
  customerName = "",
  isPending,
  onSubmit,
}: Props) => {
  const schema = zodSchemas.order.createOrder;
  const defaultValues: ICreateOrderFormValues = {
    customerEmail,
    customerName,
    customerComment: "",
    customerPhone: "",
  };
  const form = useForm<ICreateOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { handleSubmit, reset } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="sticky top-28">
          <CardHeader>
            <CardTitle>Контактні дані</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ми використаємо ці дані для підтвердження замовлення.
            </p>
          </CardHeader>

          <CardContent>
            <FieldSet disabled={isPending} className="space-y-4">
              <Field>
                <FieldLabel>Електронна пошта</FieldLabel>
                <Input value={customerEmail} readOnly />
              </Field>

              <CustomerName />

              <Controller
                name="customerPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Телефон</FieldLabel>
                    <Input {...field} placeholder="Номер телефону" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="customerComment"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Коментар</FieldLabel>
                    <Textarea
                      {...field}
                      placeholder="Побажання щодо отримання, часу або інша важлива інформація"
                      className="min-h-24"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => reset()}
            >
              Скинути
            </Button>
            <LoadingButton type="submit" isPending={isPending} className="flex-1">
              Оформити
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};

export default CheckoutForm;
