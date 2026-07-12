"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useAllOrders } from "@/features/order/hooks/useAllOrders";
import { ShoppingBasket } from "lucide-react";
import AdminOrdersView from "./AdminOrdersView";

const AdminOrders = () => {
  const { data: orders, isLoading, isError } = useAllOrders();

  if (isLoading) return <Loader />;
  if (isError || !orders) {
    return (
      <StateScreen
        title="We couldn't load the orders"
        description="Please refresh the page and try again."
      />
    );
  }
  if (orders.length === 0) {
    return (
      <StateScreen
        title="No orders yet"
        description="Customer orders will appear here."
        icon={<ShoppingBasket />}
      />
    );
  }

  return <AdminOrdersView orders={orders} />;
};

export default AdminOrders;
