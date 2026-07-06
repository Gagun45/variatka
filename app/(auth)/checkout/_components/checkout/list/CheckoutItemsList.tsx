import { ICartItem } from "@/zustand/cart.store";
import CheckoutItemCard from "./card/CheckoutItemCard";

interface Props {
  items: ICartItem[];
}

const CheckoutItemsList = ({ items }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <CheckoutItemCard item={item} key={item.recipeId} />
      ))}
    </div>
  );
};

export default CheckoutItemsList;
