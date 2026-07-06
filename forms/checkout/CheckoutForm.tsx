import { ICreateOrderFormValues } from "@/zod/order.schema";
import { zodSchemas } from "@/zod/zod.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import CustomerName from "./fields/CustomerName";
import { FieldSet } from "@/components/ui/field";
import { LoadingButton } from "@/components/loading-btn/LoadingButton";
import { Button } from "@/components/ui/button";

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-2">
        <FieldSet disabled={isPending} className="space-y-4">
          <CustomerName />
          <Button type="button" variant={"destructive"} onClick={() => reset()}>
            Reset
          </Button>
          <LoadingButton type="submit" isPending={isPending}>
            Order
          </LoadingButton>
        </FieldSet>
      </form>
    </FormProvider>
  );
};

export default CheckoutForm;
