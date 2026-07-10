import { Accordion } from "@/components/ui/accordion";
import { IPublicOrder } from "@/lib/types.order";
import { OrderAccordionItem } from "./item/MyOrderListItem";

interface Props {
  orders: IPublicOrder[];
}

const MyOrdersList = ({ orders }: Props) => {
  console.log(orders);
  return (
    <Accordion type="single" collapsible className="w-full gap-3">
      {orders.map((order) => (
        <OrderAccordionItem key={order.id} order={order} />
      ))}
    </Accordion>
  );
};

export default MyOrdersList;
