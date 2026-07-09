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
        title="Checkout defaults"
        description="Saved contact details used to pre-fill new orders."
      />

      <dl className="overflow-hidden rounded-lg border border-border/70 bg-background">
        <InfoRow
          icon={ShoppingBag}
          label="Recipient name"
          value={user.orderName}
          fallback="Not set yet"
        />
        <Separator />
        <InfoRow
          icon={Phone}
          label="Phone number"
          value={user.orderPhone}
          fallback="Not set yet"
        />
      </dl>
    </section>
  );
}
