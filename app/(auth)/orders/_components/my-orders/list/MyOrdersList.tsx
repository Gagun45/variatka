import { Accordion } from "@/components/ui/accordion";
import { IPublicOrder } from "@/lib/types.order";
import { OrderAccordionItem } from "./item/MyOrderListItem";

interface Props {
  orders: IPublicOrder[];
  canUpdateStatus?: boolean;
}

const MyOrdersList = ({ orders, canUpdateStatus = false }: Props) => {
  return (
    <Accordion type="single" collapsible className="w-full gap-3">
      {orders.map((order) => (
        <OrderAccordionItem
          key={order.id}
          order={order}
          canUpdateStatus={canUpdateStatus}
        />
      ))}
    </Accordion>
  );
};

export default MyOrdersList;
