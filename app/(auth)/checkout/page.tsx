import Checkout from "./_components/checkout/Checkout";

const CheckoutPage = () => {
  return (
    <main>
      <div className="space-y-1">
        <h1>Оформлення замовлення</h1>
        <p className="text-sm text-muted-foreground">
          Перевірте кошик і вкажіть контактні дані для замовлення.
        </p>
      </div>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
