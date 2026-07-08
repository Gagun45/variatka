import React from "react";
import Checkout from "./_components/checkout/Checkout";

const CheckoutPage = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Review your cart and add the contact details for this order.
        </p>
      </div>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
