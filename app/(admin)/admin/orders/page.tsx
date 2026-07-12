import AdminOrders from "./_components/AdminOrders";

export const metadata = {
  title: "Orders",
};

const AdminOrdersPage = () => {
  return (
    <main>
      <div className="space-y-1">
        <h1>Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review all customer orders and their current status.
        </p>
      </div>
      <AdminOrders />
    </main>
  );
};

export default AdminOrdersPage;
