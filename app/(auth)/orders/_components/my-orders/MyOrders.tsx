"use client";

import Loader from "@/components/loader/Loader";
import StateScreen from "@/components/state-screen/StateScreen";
import { useMyOrders } from "@/features/order/hooks/useMyOrders";
import MyOrdersList from "./list/MyOrdersList";

const MyOrders = () => {
  const { data: orders, isLoading, isError } = useMyOrders();
  if (isLoading) return <Loader />;
  if (!orders || isError) return <StateScreen />;
  if (orders.length === 0) return <StateScreen title="No orders yet" />;
  return <MyOrdersList orders={orders} />;
};

export default MyOrders;
