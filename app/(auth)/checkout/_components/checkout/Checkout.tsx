"use client";

import StateScreen from "@/components/state-screen/StateScreen";
import { selectCartItems, useCartStore } from "@/zustand/cart.store";
import CheckoutItemsList from "./list/CheckoutItemsList";
import CheckoutForm from "@/forms/checkout/CheckoutForm";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrder } from "@/features/order/hooks/useCreateOrder";
import { ICreateOrderFormValues } from "@/zod/order.schema";
import { IOrderItemDto } from "@/lib/types.order";
import { useRouter } from "next/navigation";
import { frontendUrls } from "@/lib/urls";
import { ShoppingCart } from "lucide-react";

const Checkout = () => {
  const items = useCartStore((s) => selectCartItems(s));
  const clearCart = useCartStore((s) => s.clear);
  const router = useRouter();
  const { mutate, isPending } = useCreateOrder();
  const { user } = useAuth();
  if (!user)
    return (
      <StateScreen
        title="Не вдалося перевірити ваш обліковий запис"
        description="Оновіть сторінку та спробуйте увійти ще раз."
      />
    );
  if (items.length === 0)
    return (
      <StateScreen
        title="Ваш кошик порожній"
        description="Додайте товари до кошика, перш ніж оформлювати замовлення."
        icon={<ShoppingCart />}
      />
    );
  const onSumbit = (formValues: ICreateOrderFormValues) => {
    const orderItems: IOrderItemDto[] = items.map((item) => ({
      amount: item.quantity,
      id: item.recipeId,
    }));
    mutate(
      { formValues, orderItems },
      {
        onSuccess: () => {
          clearCart();
          router.push(frontendUrls.public.orders);
        },
      },
    );
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
      <div className="min-w-0">
        <CheckoutItemsList items={items} />
      </div>
      <CheckoutForm
        customerEmail={user.email}
        customerName={user.orderName ?? ""}
        isPending={isPending}
        onSubmit={onSumbit}
      />
    </div>
  );
};

export default Checkout;
