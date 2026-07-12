import MyOrders from "./_components/my-orders/MyOrders";

const OrdersPage = () => {
  return (
    <main>
      <div className="space-y-1">
        <h1>Мої замовлення</h1>
        <p className="text-sm text-muted-foreground">
          Переглядайте свої замовлення, контактні дані та товари в кожному з них.
        </p>
      </div>
      <MyOrders />
    </main>
  );
};

export default OrdersPage;
