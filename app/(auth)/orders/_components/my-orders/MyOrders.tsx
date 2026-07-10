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

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-md border bg-card/60">
        <Loader />
      </div>
    );
  }

  if (!orders || isError) {
    return (
      <div className="min-h-64 rounded-md border bg-card/60">
        <StateScreen
          title="We couldn't load your orders"
          description="Please refresh the page and try again."
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-64 rounded-md border bg-card/60">
        <StateScreen
          title="No orders yet"
          description="Your completed checkouts will appear here."
          action={
            <Button asChild>
              <Link href={frontendUrls.public.recipes}>
                <ShoppingBasket />
                Browse recipes
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <section aria-label="Order history" className="w-full">
      <MyOrdersList orders={orders} />
    </section>
  );
};

export default MyOrders;
