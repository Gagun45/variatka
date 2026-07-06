import { IPublicOrder } from "@/lib/types.order";

interface Props {
  order: IPublicOrder;
}

const MyOrderCard = ({ order }: Props) => {
  return (
    <div className="p-2 flex border">
      {order.id} - {order.status}
    </div>
  );
};

export default MyOrderCard;
