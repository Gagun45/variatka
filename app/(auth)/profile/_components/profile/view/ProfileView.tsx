import { Separator } from "@/components/ui/separator";
import { IUser } from "@/lib/types";
import { Mail, Phone, ShoppingBag, UserRound } from "lucide-react";
import { ComponentType } from "react";

interface Props {
  user: IUser;
}

const ProfileView = ({ user }: Props) => {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-4">
        <SectionHeader
          title="Account details"
          description="Your sign-in email and public display name."
        />

        <dl className="overflow-hidden rounded-lg border border-border/70">
          <InfoRow icon={Mail} label="Email address" value={user.email} />
          <Separator />
          <InfoRow icon={UserRound} label="Display name" value={user.name} />
        </dl>
      </section>

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
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

interface InfoRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

const InfoRow = ({ icon: Icon, label, value, fallback = "-" }: InfoRowProps) => {
  const displayValue = value?.trim() ? value : fallback;
  const isFallback = displayValue === fallback;

  return (
    <div className="grid gap-2 p-4 sm:grid-cols-[minmax(10rem,0.75fr)_1fr] sm:items-center">
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd
        className={`break-words font-medium sm:text-right ${isFallback ? "font-normal italic text-muted-foreground/70" : "text-foreground"}`}
      >
        {displayValue}
      </dd>
    </div>
  );
};

export default ProfileView;
