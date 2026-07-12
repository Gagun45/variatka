import { Separator } from "@/components/ui/separator";
import { IUser } from "@/lib/types";
import { Phone, ShoppingBag } from "lucide-react";
import InfoRow from "../shared/InfoRow";
import SectionHeader from "../shared/SectionHeader";

interface Props {
  user: IUser;
}

export default function CheckoutDefaultsSection({ user }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-border/70 bg-muted/30 p-4">
      <SectionHeader
        title="Контакти для замовлень"
        description="Збережені контактні дані для автоматичного заповнення нових замовлень."
      />

      <dl className="overflow-hidden rounded-lg border border-border/70 bg-background">
        <InfoRow
          icon={ShoppingBag}
          label="Ім’я отримувача"
          value={user.orderName}
          fallback="Ще не вказано"
        />
        <Separator />
        <InfoRow
          icon={Phone}
          label="Номер телефону"
          value={user.orderPhone}
          fallback="Ще не вказано"
        />
      </dl>
    </section>
  );
}
