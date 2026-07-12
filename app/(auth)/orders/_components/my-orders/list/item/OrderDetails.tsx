import type { IPublicOrder } from "@/lib/types.order";
import {
  Mail,
  MessageSquareText,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { OrderItemRow } from "./OrderItemRow";

interface Props {
  order: IPublicOrder;
  itemCount: number;
}

export function OrderDetails({ order, itemCount }: Props) {
  return (
    <div className="grid gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
      <section aria-labelledby={`customer-${order.id}`}>
        <h3 id={`customer-${order.id}`} className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
          Контактні дані
        </h3>
        <dl className="grid gap-3 text-sm">
          <Contact icon={<UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />} label="Ім’я" value={order.customerName} />
          <Contact icon={<Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />} label="Електронна пошта" value={order.customerEmail} breakAll />
          {order.customerPhone && <Contact icon={<Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />} label="Телефон" value={order.customerPhone} />}
        </dl>
        {order.customerComment && (
          <div className="mt-5 flex items-start gap-3 border-t pt-4 text-sm">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Коментар до замовлення</p>
              <p className="mt-1 break-words leading-relaxed">{order.customerComment}</p>
            </div>
          </div>
        )}
      </section>
      <section aria-labelledby={`items-${order.id}`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 id={`items-${order.id}`} className="text-xs font-semibold uppercase text-muted-foreground">Товари в замовленні</h3>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShoppingBag className="size-3.5" aria-hidden="true" />
            Усього: {itemCount}
          </span>
        </div>
        <div className="divide-y border-y">
          {order.items.map((item) => <OrderItemRow key={item.id} item={item} />)}
        </div>
      </section>
    </div>
  );
}

function Contact({ icon, label, value, breakAll = false }: { icon: React.ReactNode; label: string; value: string; breakAll?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      {icon}
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={`${breakAll ? "break-all" : "break-words"} font-medium`}>{value}</dd>
      </div>
    </div>
  );
}
