"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { Button } from "@/components/ui/button";
import { useMyOrders } from "@/features/order/hooks/useMyOrders";
import { frontendUrls } from "@/lib/urls";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import MyOrdersList from "./list/MyOrdersList";

const MyOrders = () => {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading)
    return (
      <div role="status" aria-label="Завантаження замовлень">
        <Loader />
      </div>
    );

  if (!orders || isError) {
    return (
      <StateScreen
        title="Не вдалося завантажити ваші замовлення"
        description="Оновіть сторінку та спробуйте ще раз."
      />
    );
  }

  if (orders.length === 0) {
    return (
      <StateScreen
        title="Замовлень поки немає"
        description="Ваші оформлені замовлення з’являться тут."
        icon={<ShoppingBasket />}
        action={
          <Button asChild>
            <Link href={frontendUrls.public.recipes}>Переглянути продукцію</Link>
          </Button>
        }
      />
    );
  }

  return (
    <section aria-label="Історія замовлень" className="w-full">
      <MyOrdersList orders={orders} />
    </section>
  );
};

export default MyOrders;
