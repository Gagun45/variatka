import { IPublicOrder } from "@/lib/types.order";
import MyOrderCard from "./card/MyOrderCard";

interface Props {
  orders: IPublicOrder[];
}

const MyOrdersList = ({ orders }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <MyOrderCard order={order} key={order.id} />
      ))}
    </div>
  );
};

export default MyOrdersList;
