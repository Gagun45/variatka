import { Accordion } from "@/components/ui/accordion";
import { IPublicOrder } from "@/lib/types.order";
import { OrderAccordionItem } from "./item/MyOrderListItem";

interface Props {
  orders: IPublicOrder[];
}

const MyOrdersList = ({ orders }: Props) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border px-2 rounded-md"
    >
      {orders.map((order) => (
        <OrderAccordionItem key={order.id} order={order} />
      ))}
    </Accordion>
  );
};

export default MyOrdersList;
