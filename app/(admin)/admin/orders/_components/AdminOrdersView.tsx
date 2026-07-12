"use client";

import { CategoryNavigation } from "@/components/cat-navigation/CategoryNavigation";
import StateScreen from "@/components/state-screen/StateScreen";
import { useOrderFilters } from "@/hooks/filtering/orders/useOrderFilters";
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/enumslist/order.constants";
import { IPublicOrder } from "@/lib/types.order";
import MyOrdersList from "@/app/(auth)/orders/_components/my-orders/list/MyOrdersList";
import { PackageSearch } from "lucide-react";

interface Props {
  orders: IPublicOrder[];
}

const statusConfig = {
  label: "Status",
  options: ORDER_STATUS_FILTER_OPTIONS,
};

const AdminOrdersView = ({ orders }: Props) => {
  const { status, setStatus } = useOrderFilters();
  const filteredOrders =
    status === "all"
      ? orders
      : orders.filter((order) => order.status === status);

  return (
    <section aria-label="All orders" className="mt-6 w-full">
      <CategoryNavigation
        value={status}
        onChange={setStatus}
        config={statusConfig}
        onCategoryReset={() => setStatus("all")}
        isResetActive={status === "all"}
        resetLabel="All orders"
      />

      {filteredOrders.length > 0 ? (
        <MyOrdersList orders={filteredOrders} canUpdateStatus />
      ) : (
        <StateScreen
          title="No orders with this status"
          description="Choose another status to see matching orders."
          icon={<PackageSearch />}
        />
      )}
    </section>
  );
};

export default AdminOrdersView;
