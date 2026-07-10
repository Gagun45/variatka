import MyOrders from "./_components/my-orders/MyOrders";

const OrdersPage = () => {
  return (
    <main>
      <div className="space-y-1">
        <h1>My orders</h1>
        <p className="text-sm text-muted-foreground">
          Review your orders, delivery details, and the recipes in each order.
        </p>
      </div>
      <MyOrders />
    </main>
  );
};

export default OrdersPage;
