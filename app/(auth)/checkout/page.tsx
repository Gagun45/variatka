import Checkout from "./_components/checkout/Checkout";

const CheckoutPage = () => {
  return (
    <main>
      <div className="space-y-1">
        <h1>Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Review your cart and add the contact details for this order.
        </p>
      </div>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
