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

  if (isLoading) return <Loader />;

  if (!orders || isError) {
    return (
      <StateScreen
        title="We couldn't load your orders"
        description="Please refresh the page and try again."
      />
    );
  }

  if (orders.length === 0) {
    return (
      <StateScreen
        title="No orders yet"
        description="Your completed checkouts will appear here."
        icon={<ShoppingBasket />}
        action={
          <Button asChild>
            <Link href={frontendUrls.public.recipes}>Browse recipes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <section aria-label="Order history" className="w-full">
      <MyOrdersList orders={orders} />
    </section>
  );
};

export default MyOrders;
