import MyOrders from "./_components/my-orders/MyOrders";

const OrdersPage = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-left text-2xl font-semibold tracking-tight">
          My orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Review your orders, delivery details, and the recipes in each order.
        </p>
      </div>
      <MyOrders />
    </main>
  );
};

export default OrdersPage;
