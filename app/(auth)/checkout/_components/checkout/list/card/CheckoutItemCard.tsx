import { ICartItem } from "@/zustand/cart.store";

interface Props {
  item: ICartItem;
}

const CheckoutItemCard = ({ item }: Props) => {
  return (
    <div className="flex border p-2">
      {item.name} - {item.quantity}
    </div>
  );
};

export default CheckoutItemCard;
